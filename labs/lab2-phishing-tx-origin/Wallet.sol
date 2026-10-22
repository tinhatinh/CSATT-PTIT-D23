// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

// HỢP ĐỒNG NẠN NHÂN
contract Wallet {
    address public owner;

    constructor() payable {
        owner = msg.sender;
    }
    function transfer(address payable _to, uint _amount) public {
        // LỖ HỔNG BẢO MẬT: Xác thực người gửi bằng tx.origin thay vì msg.sender.
        // tx.origin là địa chỉ khởi tạo giao dịch ban đầu, cho phép hợp đồng trung gian lừa đảo (phishing)
        require(tx.origin == owner, "Error: Not the owner");

        (bool sent, ) = _to.call{value: _amount}("");
        require(sent, "Failed to send Ether");
    }

    // Hàm helper để xem số dư của ví
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}