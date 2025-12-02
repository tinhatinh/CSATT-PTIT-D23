// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

// HỢP ĐỒNG NẠN NHÂN
contract KingOfEther {
    address public king;
    uint public prize;

    constructor() payable {
        king = msg.sender;
        prize = msg.value;
    }

    function claimThrone() public payable {
        // Người chơi mới phải trả nhiều hơn giải thưởng hiện tại
        require(msg.value > prize, "Need to pay more to become the king");

        // LỖ HỔNG NẰM Ở ĐÂY:
        // Hợp đồng tự động "đẩy" (push) tiền cho vị vua cũ.
        // Nếu giao dịch này thất bại, toàn bộ hàm claimThrone sẽ revert.
        (bool sent, ) = king.call{value: prize}("");
        require(sent, "Failed to send prize to previous king");

        // Cập nhật vua mới và giải thưởng mới
        king = msg.sender;
        prize = msg.value;
    }
}