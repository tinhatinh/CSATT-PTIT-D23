// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

// HỢP ĐỒNG ĐÃ ĐƯỢC VÁ LỖ HỔNG
// Sử dụng msg.sender thay vì tx.origin để đảm bảo chỉ chính chủ ví gọi trực tiếp mới hợp lệ
contract WalletSafe {
    address public owner;

    constructor() payable {
        owner = msg.sender;
    }

    function transfer(address payable _to, uint _amount) public {
        // VÁ LỖ HỔNG: msg.sender đại diện cho địa chỉ trực tiếp gọi hàm.
        // Khi kẻ tấn công dùng hợp đồng trung gian để lừa đảo, msg.sender sẽ là địa chỉ hợp đồng tấn công
        // (không phải owner), do đó giao dịch bị từ chối ngay lập tức.
        require(msg.sender == owner, "Error: Not the owner");

        (bool sent, ) = _to.call{value: _amount}("");
        require(sent, "Failed to send Ether");
    }

    // Hàm helper để xem số dư của ví
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}
