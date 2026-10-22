// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.0/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.0/contracts/access/Ownable.sol";

contract FlappyHatNFT is ERC721, Ownable {
    uint256 public nextTokenId;
    mapping(uint256 => uint256) public hatLevelOf; // tokenId -> level (5,10,25,50,75,100)

    constructor() ERC721("FlappyHat", "FHAT") {
        // owner = msg.sender từ Ownable
    }

    function mintHat(address to, uint256 hatLevel) external returns (uint256) {
    uint256 tokenId = nextTokenId;
    nextTokenId += 1;

    _safeMint(to, tokenId);
    hatLevelOf[tokenId] = hatLevel;

    return tokenId;
    }

    function burn(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        _burn(tokenId);
        delete hatLevelOf[tokenId];
    }
}