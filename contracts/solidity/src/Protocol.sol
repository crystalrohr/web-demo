// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

interface IRohrToken is IERC20 {
    function burn(address from, uint256 amount) external;
}

interface ICrystalrohrStaking {
    function stake(address staker, uint256 amount) external;
    function unstake(address staker, uint256 amount) external;
    function claimRewards(address staker, uint256 rewardNumerator) external;
    function isValidStaker(address staker) external view returns (bool);
    function getStakedAmount(address staker) external view returns (uint256);
    function getTotalStaked() external view returns (uint256);
}

contract CrystalrohrProtocol {
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.AddressSet;

    // Constants
    uint256 public constant VIDEO_OP_PRICE = 100_000_000;

    // Structs
    struct Video {
        string videoHash;
        address userAddress;
        address nodeAddress;
        string captionHash;
        bool exists;
    }

    struct Node {
        uint256 operationProofs;
        string pendingVideoHash;
        address taskAddress;
        bool exists;
    }

    // State variables
    ICrystalrohrStaking public stakingContract;
    IRohrToken public rohrToken;
    EnumerableSet.AddressSet private activeNodes;
    mapping(address => Node) public nodes;
    mapping(address => Video) public userVideos;

    // Events
    event VideoCaptionRequested(
        address indexed userAddress,
        string videoHash,
        address indexed nodeAddress
    );
    event VideoCaptionCompleted(
        address indexed userAddress,
        string videoHash,
        address indexed nodeAddress,
        string captionHash
    );
    event NodeJoinedPool(address indexed nodeAddress);
    event NodeLeftPool(address indexed nodeAddress);

    // Errors
    error NodeNotRegistered();
    error InvalidVideoHash();
    error NodeNotActive();
    error NodeAlreadyActive();
    error NodeUnavailable();
    error VideoNotFound();
    error NoRewardsAvailable();
    error VideoHashMismatch();

    constructor(address _rohrToken, address _stakingContract) {
        rohrToken = IRohrToken(_rohrToken);
        stakingContract = ICrystalrohrStaking(_stakingContract);
    }

    function stake(uint256 amount) external {
        stakingContract.stake(msg.sender, amount);
    }

    function unstake(uint256 amount) external {
        stakingContract.unstake(msg.sender, amount);
    }

    function claimRewards() external {
        Node storage node = nodes[msg.sender];
        if (!node.exists) revert NodeNotRegistered();

        uint256 rewardMultiplier = node.operationProofs;
        if (rewardMultiplier == 0) revert NoRewardsAvailable();
        node.operationProofs = 0;

        stakingContract.claimRewards(msg.sender, rewardMultiplier);
    }

    function joinPool() external {
        if (!stakingContract.isValidStaker(msg.sender))
            revert NodeNotRegistered();
        if (!nodes[msg.sender].exists) {
            nodes[msg.sender] = Node({
                operationProofs: 0,
                pendingVideoHash: "",
                taskAddress: address(0),
                exists: true
            });
        }

        if (bytes(nodes[msg.sender].pendingVideoHash).length > 0)
            revert NodeAlreadyActive();

        activeNodes.add(msg.sender);
        emit NodeJoinedPool(msg.sender);
    }

    function captionVideo(string calldata videoHash) external {
        if (bytes(videoHash).length == 0) revert InvalidVideoHash();

        rohrToken.burn(msg.sender, VIDEO_OP_PRICE);

        address selectedNode = _randomlyPickAddress();
        if (selectedNode == address(0)) revert NodeUnavailable();

        nodes[selectedNode].pendingVideoHash = videoHash;
        nodes[selectedNode].taskAddress = msg.sender;

        userVideos[msg.sender] = Video({
            videoHash: videoHash,
            userAddress: msg.sender,
            nodeAddress: selectedNode,
            captionHash: "",
            exists: true
        });

        emit VideoCaptionRequested(msg.sender, videoHash, selectedNode);
    }

    function completeCaptionVideo(string calldata captionHash) external {
        Node storage node = nodes[msg.sender];
        if (!node.exists || bytes(node.pendingVideoHash).length == 0)
            revert NodeNotActive();

        Video storage video = userVideos[node.taskAddress];
        if (!video.exists) revert VideoNotFound();

        video.captionHash = captionHash;

        emit VideoCaptionCompleted(
            video.userAddress,
            node.pendingVideoHash,
            msg.sender,
            captionHash
        );

        node.operationProofs++;
        node.pendingVideoHash = "";
        node.taskAddress = address(0);

        activeNodes.add(msg.sender);
    }

    function _randomlyPickAddress() internal returns (address) {
        uint256 totalNodes = activeNodes.length();
        if (totalNodes == 0) return address(0);

        uint256 totalStaked = stakingContract.getTotalStaked();

        uint256 randomValue = uint256(
            keccak256(
                abi.encodePacked(block.timestamp, block.prevrandao, msg.sender)
            )
        ) % totalStaked;

        uint256 cumulativeStake = 0;
        for (uint256 i = 0; i < totalNodes; i++) {
            address nodeAddress = activeNodes.at(i);
            cumulativeStake += stakingContract.getStakedAmount(nodeAddress);
            if (randomValue < cumulativeStake) {
                activeNodes.remove(nodeAddress);
                return nodeAddress;
            }
        }

        address lastNode = activeNodes.at(totalNodes - 1);
        activeNodes.remove(lastNode);
        return lastNode;
    }

    function getVideoCaption(
        address userAddress
    ) public view returns (string memory) {
        require(userVideos[userAddress].exists, "Video not found");
        return userVideos[userAddress].captionHash;
    }
}
