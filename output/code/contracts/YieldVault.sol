// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title YieldVault
 * @author YieldFlow Team
 * @notice Main vault contract for user deposits and yield optimization
 * @dev Implements ERC4626 standard for vault tokens
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

interface IStrategy {
    function invest(uint256 amount) external returns (uint256);
    function withdraw(uint256 amount) external returns (uint256);
    function harvest() external returns (uint256);
    function totalAssets() external view returns (uint256);
    function asset() external view returns (address);
}

interface IRiskController {
    function assessRisk(address strategy) external view returns (uint256 riskScore);
    function isEmergency() external view returns (bool);
}

/**
 * @title YieldVault
 * @dev ERC4626 compliant vault with AI agent integration
 */
contract YieldVault is ERC20, ReentrancyGuard, AccessControl, Pausable {
    using SafeERC20 for IERC20;

    // Roles
    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");
    bytes32 public constant STRATEGIST_ROLE = keccak256("STRATEGIST_ROLE");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");

    // Asset token (e.g., USDC, MONAD)
    IERC20 public immutable asset;

    // Risk controller
    IRiskController public riskController;

    // Strategies
    address[] public strategies;
    mapping(address => bool) public isStrategy;
    mapping(address => uint256) public strategyAllocation; // percentage in basis points

    // Constants
    uint256 public constant MAX_STRATEGIES = 10;
    uint256 public constant MAX_ALLOCATION = 10000; // 100%
    uint256 public constant MIN_INVESTMENT = 1e6; // 1 USDC

    // Fees
    uint256 public performanceFee = 1000; // 10% in basis points
    uint256 public managementFee = 50; // 0.5% annual in basis points
    address public feeRecipient;

    // Events
    event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares);
    event StrategyAdded(address indexed strategy, uint256 allocation);
    event StrategyRemoved(address indexed strategy);
    event Rebalanced(address[] strategies, uint256[] allocations);
    event Harvested(uint256 totalYield, uint256 fee);
    event RiskControllerUpdated(address indexed newController);

    constructor(
        address _asset,
        string memory _name,
        string memory _symbol,
        address _riskController,
        address _feeRecipient
    ) ERC20(_name, _symbol) {
        require(_asset != address(0), "Invalid asset");
        require(_riskController != address(0), "Invalid risk controller");
        require(_feeRecipient != address(0), "Invalid fee recipient");

        asset = IERC20(_asset);
        riskController = IRiskController(_riskController);
        feeRecipient = _feeRecipient;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GUARDIAN_ROLE, msg.sender);
        _grantRole(STRATEGIST_ROLE, msg.sender);
    }

    /**
     * @notice Deposit assets and receive vault shares
     * @param assets Amount of assets to deposit
     * @param receiver Address to receive the shares
     * @return shares Number of shares minted
     */
    function deposit(uint256 assets, address receiver) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (uint256 shares) 
    {
        require(assets >= MIN_INVESTMENT, "Below minimum investment");
        require(receiver != address(0), "Invalid receiver");

        shares = convertToShares(assets);
        require(shares > 0, "Zero shares");

        asset.safeTransferFrom(msg.sender, address(this), assets);
        _mint(receiver, shares);

        emit Deposit(msg.sender, receiver, assets, shares);
    }

    /**
     * @notice Withdraw assets by burning shares
     * @param assets Amount of assets to withdraw
     * @param receiver Address to receive the assets
     * @param owner Address that owns the shares
     * @return shares Number of shares burned
     */
    function withdraw(uint256 assets, address receiver, address owner) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (uint256 shares) 
    {
        require(receiver != address(0), "Invalid receiver");

        shares = convertToShares(assets);
        require(shares > 0, "Zero shares");

        if (msg.sender != owner) {
            _spendAllowance(owner, msg.sender, shares);
        }

        uint256 available = totalIdle();
        if (available < assets) {
            _withdrawFromStrategies(assets - available);
        }

        _burn(owner, shares);
        asset.safeTransfer(receiver, assets);

        emit Withdraw(msg.sender, receiver, owner, assets, shares);
    }

    /**
     * @notice AI Agent invests idle funds into strategies
     * @dev Only callable by AGENT_ROLE
     */
    function investIdleFunds() 
        external 
        onlyRole(AGENT_ROLE) 
        whenNotPaused 
    {
        uint256 idle = totalIdle();
        if (idle == 0) return;

        for (uint256 i = 0; i < strategies.length; i++) {
            address strategy = strategies[i];
            uint256 allocation = strategyAllocation[strategy];
            if (allocation > 0) {
                uint256 amount = (idle * allocation) / MAX_ALLOCATION;
                if (amount > 0) {
                    asset.safeApprove(strategy, amount);
                    IStrategy(strategy).invest(amount);
                }
            }
        }
    }

    /**
     * @notice Rebalance funds across strategies
     * @dev Only callable by AGENT_ROLE
     * @param _strategies Array of strategy addresses
     * @param _allocations Array of new allocations (basis points)
     */
    function rebalance(
        address[] calldata _strategies,
        uint256[] calldata _allocations
    ) external onlyRole(AGENT_ROLE) whenNotPaused {
        require(_strategies.length == _allocations.length, "Length mismatch");
        require(_strategies.length <= MAX_STRATEGIES, "Too many strategies");

        // Validate total allocation
        uint256 totalAlloc;
        for (uint256 i = 0; i < _allocations.length; i++) {
            totalAlloc += _allocations[i];
        }
        require(totalAlloc <= MAX_ALLOCATION, "Allocation exceeds 100%");

        // Withdraw all funds from current strategies
        for (uint256 i = 0; i < strategies.length; i++) {
            IStrategy(strategies[i]).withdraw(
                IStrategy(strategies[i]).totalAssets()
            );
        }

        // Update allocations
        for (uint256 i = 0; i < strategies.length; i++) {
            strategyAllocation[strategies[i]] = 0;
        }

        // Set new allocations and invest
        uint256 totalAssets_ = totalAssets();
        for (uint256 i = 0; i < _strategies.length; i++) {
            require(isStrategy[_strategies[i]], "Invalid strategy");
            strategyAllocation[_strategies[i]] = _allocations[i];
            
            uint256 amount = (totalAssets_ * _allocations[i]) / MAX_ALLOCATION;
            if (amount > 0) {
                asset.safeApprove(_strategies[i], amount);
                IStrategy(_strategies[i]).invest(amount);
            }
        }

        emit Rebalanced(_strategies, _allocations);
    }

    /**
     * @notice Harvest yields from all strategies
     * @dev Only callable by AGENT_ROLE
     */
    function harvest() 
        external 
        onlyRole(AGENT_ROLE) 
        whenNotPaused 
        returns (uint256 totalYield) 
    {
        for (uint256 i = 0; i < strategies.length; i++) {
            totalYield += IStrategy(strategies[i]).harvest();
        }

        if (totalYield > 0) {
            uint256 fee = (totalYield * performanceFee) / MAX_ALLOCATION;
            if (fee > 0) {
                asset.safeTransfer(feeRecipient, fee);
            }
            emit Harvested(totalYield, fee);
        }
    }

    /**
     * @notice Add a new strategy
     * @dev Only callable by STRATEGIST_ROLE
     */
    function addStrategy(address _strategy, uint256 _allocation) 
        external 
        onlyRole(STRATEGIST_ROLE) 
    {
        require(_strategy != address(0), "Invalid strategy");
        require(!isStrategy[_strategy], "Strategy exists");
        require(strategies.length < MAX_STRATEGIES, "Max strategies reached");
        require(_allocation <= MAX_ALLOCATION, "Invalid allocation");

        strategies.push(_strategy);
        isStrategy[_strategy] = true;
        strategyAllocation[_strategy] = _allocation;

        emit StrategyAdded(_strategy, _allocation);
    }

    /**
     * @notice Remove a strategy
     * @dev Only callable by STRATEGIST_ROLE
     */
    function removeStrategy(address _strategy) 
        external 
        onlyRole(STRATEGIST_ROLE) 
    {
        require(isStrategy[_strategy], "Not a strategy");

        // Withdraw all funds from strategy first
        IStrategy(_strategy).withdraw(IStrategy(_strategy).totalAssets());

        // Remove from array
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i] == _strategy) {
                strategies[i] = strategies[strategies.length - 1];
                strategies.pop();
                break;
            }
        }

        isStrategy[_strategy] = false;
        strategyAllocation[_strategy] = 0;

        emit StrategyRemoved(_strategy);
    }

    /**
     * @notice Emergency exit - withdraw all funds
     * @dev Only callable by GUARDIAN_ROLE or when risk controller signals emergency
     */
    function emergencyExit() 
        external 
        onlyRole(GUARDIAN_ROLE) 
    {
        _pause();

        for (uint256 i = 0; i < strategies.length; i++) {
            IStrategy(strategies[i]).withdraw(
                IStrategy(strategies[i]).totalAssets()
            );
        }
    }

    /**
     * @notice Convert assets to shares
     */
    function convertToShares(uint256 assets) public view returns (uint256) {
        uint256 totalSupply_ = totalSupply();
        if (totalSupply_ == 0) {
            return assets;
        }
        return (assets * totalSupply_) / totalAssets();
    }

    /**
     * @notice Convert shares to assets
     */
    function convertToAssets(uint256 shares) public view returns (uint256) {
        uint256 totalSupply_ = totalSupply();
        if (totalSupply_ == 0) {
            return shares;
        }
        return (shares * totalAssets()) / totalSupply_;
    }

    /**
     * @notice Get total assets managed by vault
     */
    function totalAssets() public view returns (uint256) {
        uint256 total = asset.balanceOf(address(this));
        
        for (uint256 i = 0; i < strategies.length; i++) {
            total += IStrategy(strategies[i]).totalAssets();
        }
        
        return total;
    }

    /**
     * @notice Get idle (uninvested) assets
     */
    function totalIdle() public view returns (uint256) {
        return asset.balanceOf(address(this));
    }

    /**
     * @notice Withdraw from strategies to meet withdrawal demand
     */
    function _withdrawFromStrategies(uint256 amount) internal {
        uint256 withdrawn;
        
        for (uint256 i = 0; i < strategies.length && withdrawn < amount; i++) {
            address strategy = strategies[i];
            uint256 strategyAssets = IStrategy(strategy).totalAssets();
            
            if (strategyAssets > 0) {
                uint256 toWithdraw = amount - withdrawn;
                if (toWithdraw > strategyAssets) {
                    toWithdraw = strategyAssets;
                }
                withdrawn += IStrategy(strategy).withdraw(toWithdraw);
            }
        }
    }

    /**
     * @notice Update risk controller
     */
    function setRiskController(address _controller) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(_controller != address(0), "Invalid controller");
        riskController = IRiskController(_controller);
        emit RiskControllerUpdated(_controller);
    }

    /**
     * @notice Update fee recipient
     */
    function setFeeRecipient(address _recipient) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(_recipient != address(0), "Invalid recipient");
        feeRecipient = _recipient;
    }

    /**
     * @notice Update performance fee
     */
    function setPerformanceFee(uint256 _fee) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(_fee <= 2000, "Fee too high"); // Max 20%
        performanceFee = _fee;
    }

    /**
     * @notice Pause contract
     */
    function pause() external onlyRole(GUARDIAN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause contract
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @notice Get all strategies
     */
    function getStrategies() external view returns (address[] memory) {
        return strategies;
    }

    /**
     * @notice Get APY estimate
     */
    function estimateAPY() external view returns (uint256) {
        uint256 totalAssets_ = totalAssets();
        if (totalAssets_ == 0) return 0;

        uint256 weightedAPY;
        for (uint256 i = 0; i < strategies.length; i++) {
            // This would integrate with real APY data in production
            weightedAPY += strategyAllocation[strategies[i]]; // Placeholder
        }

        return weightedAPY;
    }
}
