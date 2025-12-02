// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./FlappyHatNFT.sol";

contract FlappyGame {
    address public owner;
    FlappyHatNFT public hat;

    uint256 public constant playFee = 1 ether;

    uint256[] public levels = [5, 10, 25, 50, 75, 100];

    mapping(uint256 => uint256) public hatPrice;

    mapping(address => mapping(uint256 => bool)) public hasReceivedLevel;

    event GamePlayed(address indexed player, uint256 fee);
    event ScoreSubmitted(address indexed player, uint256 score);
    event HatRewarded(address indexed player, uint256 tokenId, uint256 level);
    event HatSold(address indexed player, uint256 tokenId, uint256 level, uint256 amount);
    event Withdraw(address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    constructor(address _hatContract) {
        owner = msg.sender;
        hat = FlappyHatNFT(_hatContract);

        hatPrice[5] = 0.3 ether;
        hatPrice[10] = 0.6 ether;
        hatPrice[25] = 1 ether;
        hatPrice[50] = 1.6 ether;
        hatPrice[75] = 2.3 ether;
        hatPrice[100] = 3 ether;
    }

    receive() external payable {}
    fallback() external payable {}

    function playGame() external payable {
        require(msg.value == playFee, "Must pay exactly 1 ETH");
        emit GamePlayed(msg.sender, msg.value);
    }

    function submitScore(uint256 score) external {
        emit ScoreSubmitted(msg.sender, score);

        for (uint256 i = 0; i < levels.length; i++) {
            uint256 level = levels[i];
            if (score >= level && !hasReceivedLevel[msg.sender][level]) {
                hasReceivedLevel[msg.sender][level] = true;

                uint256 tokenId = hat.mintHat(msg.sender, level);
                emit HatRewarded(msg.sender, tokenId, level);
            }
        }
    }

    function sellHat(uint256 tokenId) external {

    require(hat.ownerOf(tokenId) == msg.sender, "Not owner of this hat");


    uint256 level = hat.hatLevelOf(tokenId);
    uint256 amount = hatPrice[level];
    require(amount > 0, "No price set for this level");
    require(address(this).balance >= amount, "Game contract not enough ETH");

    hat.transferFrom(msg.sender, address(this), tokenId);

    (bool ok, ) = payable(msg.sender).call{value: amount}("");
    require(ok, "Transfer failed");

    emit HatSold(msg.sender, tokenId, level, amount);
}

    function setHatPrice(uint256 level, uint256 price) external onlyOwner {
        hatPrice[level] = price;
    }

    function withdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Not enough balance");
        (bool ok, ) = payable(owner).call{value: amount}("");
        require(ok, "Withdraw failed");
        emit Withdraw(owner, amount);
    }

    function getLevels() external view returns (uint256[] memory) {
        return levels;
    }

    function contractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}