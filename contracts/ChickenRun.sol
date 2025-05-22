// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function transfer(address to, uint256 value) external returns (bool);
}

contract ChickenRun {
    // Token and admin settings
    address public immutable token;
    address public admin;

    // Current chicken holder info
    address public holder;
    uint256 public lastHoldTime;

    // Configurable parameters
    uint256 public rewardPerSec = 1 * 1e18;
    uint256 public stealCost = 1000 * 1e18;

    // Holder history record
    struct Record {
        uint256 fid;
        address player;
        uint256 timestamp;
    }

    Record[] public history;
    mapping(address => uint256) public totalHeld;
    // Tracks total reward paid to each user
    mapping(address => uint256) public totalRewardPaid;

    address[] public players;

    // Events
    event StealSuccess(address indexed user, uint256 fid, address prevHolder);
    event RewardPaid(address indexed to, uint256 amount, uint256 heldTime);
    event HolderChanged(address indexed newHolder);

    constructor(address _token) {
        token = _token;
        admin = msg.sender;
    }

    function stealChicken(uint256 fid) external {
        // 1. Pay 1000 CHICKEN upfront
        bool paid = IERC20(token).transferFrom(msg.sender, address(this), stealCost);
        require(paid, "Payment failed");

        address prevHolder = holder;
        uint256 currentTime = block.timestamp;

        // 2. Reward previous holder
        if (prevHolder != address(0) && lastHoldTime > 0) {
            uint256 held = currentTime - lastHoldTime;
            if (held > 0) {
                uint256 reward = held * rewardPerSec;
                totalHeld[prevHolder] += held;
                totalRewardPaid[prevHolder] += reward;
                IERC20(token).transfer(prevHolder, reward);
                emit RewardPaid(prevHolder, reward, held);
            }
        }

        // 3. Update new holder
        holder = msg.sender;
        if (totalHeld[msg.sender] == 0 && totalRewardPaid[msg.sender] == 0) {
            players.push(msg.sender);
        }
        lastHoldTime = currentTime;
        history.push(Record(fid, msg.sender, currentTime));
        emit HolderChanged(msg.sender);
        emit StealSuccess(msg.sender, fid, prevHolder);
    }

    function getRecentRecords(uint256 count) external view returns (Record[] memory) {
        uint256 len = history.length;
        if (len == 0) return new Record[](0);
        if (count > len) count = len;

        Record[] memory result = new Record[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = history[len - count + i];
        }
        return result;
    }

    function getPlayerHeldTime(address player) external view returns (uint256) {
        return totalHeld[player];
    }

    function setRewardPerSec(uint256 _rate) external {
        require(msg.sender == admin, "Not admin");
        rewardPerSec = _rate;
    }

    function setStealCost(uint256 _cost) external {
        require(msg.sender == admin, "Not admin");
        stealCost = _cost;
    }

    function getLeaderboard() external view returns (
        address[] memory addrs,
        uint256[] memory heldTimes,
        uint256[] memory rewardTotals
    ) {
        uint256 len = players.length;
        addrs = new address[](len);
        heldTimes = new uint256[](len);
        rewardTotals = new uint256[](len);

        for (uint256 i = 0; i < len; i++) {
            address addr = players[i];
            addrs[i] = addr;
            heldTimes[i] = totalHeld[addr];
            rewardTotals[i] = totalRewardPaid[addr];
        }
    }
}