// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IRohrToken is IERC20 {
    function burn(address from, uint256 amount) external;
    function mint(address account, uint256 value) external;
}

contract CrystalrohrStaking is Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;

    // Constants
    uint256 public constant MIN_STAKE = 100_000_000;
    uint256 public constant OPERATION_PROOFS_DENOMINATOR = 10;

    // State variables
    IRohrToken public rohrToken;
    uint256 private totalStaked;
    mapping(address => uint256) public stakedBalances;
    EnumerableSet.AddressSet private stakers;

    // Events
    event Staked(address indexed staker, uint256 amount);
    event Unstaked(address indexed staker, uint256 amount);
    event RewardsClaimed(address indexed staker, uint256 amount);

    // Errors
    error InsufficientStake();
    error NeverStaked();
    error InvalidUnstakeAmount();
    error StakeAlreadyExists();

    constructor(
        address _rohrToken,
        address initialOwner
    ) Ownable(initialOwner) {
        rohrToken = IRohrToken(_rohrToken);
    }

    function stake(address staker, uint256 amount) external onlyOwner {
        if (amount < MIN_STAKE) revert InsufficientStake();

        uint256 currentStake = stakedBalances[staker];
        stakedBalances[staker] = currentStake + amount;
        stakers.add(staker);
        totalStaked += amount;

        rohrToken.burn(staker, amount);
        emit Staked(staker, amount);
    }

    function unstake(address staker, uint256 amount) external onlyOwner {
        if (!stakers.contains(staker)) revert NeverStaked();

        uint256 currentStake = stakedBalances[staker];
        if (currentStake < amount) revert InvalidUnstakeAmount();

        stakedBalances[staker] = currentStake - amount;
        totalStaked -= amount; // Update total stake

        if (stakedBalances[staker] == 0) {
            stakers.remove(staker);
        }

        rohrToken.mint(staker, amount);
        emit Unstaked(staker, amount);
    }

    function claimRewards(
        address staker,
        uint256 rewardNumerator
    ) external onlyOwner {
        if (!stakers.contains(staker)) revert NeverStaked();
        if (stakedBalances[staker] == 0) revert InsufficientStake();

        uint256 rewardAmount = (stakedBalances[staker] * rewardNumerator) /
            OPERATION_PROOFS_DENOMINATOR;

        rohrToken.mint(staker, rewardAmount);
        emit RewardsClaimed(staker, rewardAmount);
    }

    // View functions
    function isValidStaker(address staker) public view returns (bool) {
        return stakedBalances[staker] >= MIN_STAKE;
    }

    function getStakedAmount(address staker) public view returns (uint256) {
        return stakedBalances[staker];
    }

    function getTotalStaked() external view returns (uint256) {
        return totalStaked;
    }
}
