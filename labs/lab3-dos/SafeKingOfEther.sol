// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract SafeKingOfEther {
    address public king;
    uint public prize;
    // Thêm một mapping để ghi lại số tiền đang chờ rút của mỗi người
    mapping(address => uint) public pendingWithdrawals;

    constructor() payable {
        king = msg.sender;
        prize = msg.value;
    }

    function claimThrone() public payable {
        require(msg.value > prize, "Need to pay more to become the king");

        // SỬA LỖI: Thay vì gửi tiền trực tiếp,
        // chúng ta chỉ ghi lại rằng vị vua cũ có một khoản tiền đang chờ rút.
        pendingWithdrawals[king] += prize;

        // Cập nhật vua mới và giải thưởng mới
        king = msg.sender;
        prize = msg.value;
    }

    function withdraw() public {
        uint amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No funds to withdraw");

        // Cập nhật số dư về 0 TRƯỚC KHI gửi tiền (phòng chống Reentrancy!)
        pendingWithdrawals[msg.sender] = 0;

        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Withdraw failed");
    }
}