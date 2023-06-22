/**
 *Submitted for verification at Etherscan.io on 2023-06-09
*/

// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0 <0.9.0;

contract MoneyTalk {
    address public owner;

    struct Quote {
        string text;
        uint tipFee;
    }

    Quote[] public quotes;

    event Said(string text, uint tipFee, uint index, address sender);

    constructor() {
        owner = msg.sender;
    }

    function write(string memory text) public payable {
        quotes.push(Quote(text, msg.value));
        emit Said(text, msg.value, quotes.length - 1, msg.sender);
    }

    function withdrawAll() external {
        payable(owner).transfer(address(this).balance);
    }
}