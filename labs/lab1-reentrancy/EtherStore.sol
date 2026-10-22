// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

// HỢP ĐỒNG NẠN NHÂN
contract EtherStore {
    mapping(address => uint) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() public {
        uint bal = balances[msg.sender];
        require(bal > 0, "No balance to withdraw");
        // LỖ HỔNG BẢO MẬT: Gửi Ether trước khi cập nhật số dư về 0
        // Kẻ tấn công có thể re-enter vào hàm withdraw() nhiều lần qua fallback/receive
        (bool sent, ) = msg.sender.call{value: bal}("");
        require(sent, "Failed to send Ether");

        balances[msg.sender] = 0;
    }

    // Hàm helper để kiểm tra số dư của hợp đồng
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}