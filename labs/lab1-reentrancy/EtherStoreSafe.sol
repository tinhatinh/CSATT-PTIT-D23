// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

// HỢP ĐỒNG ĐÃ ĐƯỢC VÁ LỖ HỔNG
// Sử dụng mẫu thiết kế bảo mật tiêu chuẩn: Checks-Effects-Interactions
contract EtherStoreSafe {
    mapping(address => uint) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() public {
        uint bal = balances[msg.sender];
        
        // 1. CHECKS: Kiểm tra điều kiện tiên quyết
        require(bal > 0, "No balance to withdraw");

        // 2. EFFECTS: Cập nhật trạng thái số dư nội bộ TRƯỚC KHI chuyển tiền ra ngoài
        balances[msg.sender] = 0;

        // 3. INTERACTIONS: Gửi Ether ra ngoài sau khi trạng thái đã an toàn
        (bool sent, ) = msg.sender.call{value: bal}("");
        require(sent, "Failed to send Ether");
    }

    // Hàm helper để kiểm tra số dư của hợp đồng
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}
