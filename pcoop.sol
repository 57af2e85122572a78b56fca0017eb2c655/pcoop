//    Copyright (C) <2016>  <0x54f59f57af2e85122572a78b56fca0017eb2c655>

//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.

//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.

//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.


pragma solidity ^0.4.0;

contract Owned {
    /// Prevents methods from perfoming any value transfer
    modifier noEther() {if (msg.value > 0) throw; _;}
    /// Allows only the owner to call a function
    modifier onlyOwner { if (msg.sender != owner) throw; _;}

    address owner;

    function Owned() { owner = msg.sender;}

    function changeOwner(address _newOwner) onlyOwner {
        owner = _newOwner;
    }

    function getOwner() noEther constant returns (address) {
        return owner;
    }
}

contract pcoop is Owned {
    address public owner;
    address public delegate;
    bytes32 public design;
    uint public refundPercent = 100;
    uint public maxPrice;
    uint public deadline;

    struct order {
        uint value;
        string encryptedEmail;
        string encryptedDeliveryAddress;
        string encryptedSize;
    }

    mapping (address => order) orders;

    //this event causes some problems 
    //https://github.com/ethereum/web3.js/issues/434

    event Buy (string encryptedEmail, string encryptedDeliveryAddress, string encryptedSize); 
    event Refund (address buyer, uint refundPercent);
    event Withdraw (address owner, uint withdrawPercent); 

    function pcoop(address _delegate, bytes32 _design, uint _secondsToDeadline){
        owner = msg.sender;
        delegate = _delegate;
        design = _design;
        maxPrice = 1 ether;
        deadline = now + _secondsToDeadline;
    }

    function buy(string encryptedEmail, string encryptedDeliveryAddress, string encryptedSize) payable returns (uint) {
        if (msg.value != maxPrice) throw;
        if (now > deadline) throw;
        if (orders[msg.sender].value != 0) throw;
        orders[msg.sender] = order(msg.value, encryptedEmail, encryptedDeliveryAddress, encryptedSize);      
        Buy(encryptedEmail, encryptedDeliveryAddress, encryptedSize);
        return(msg.value);
    }

    function refund()  returns (uint) {
        uint refund = (orders[msg.sender].value * refundPercent / 100);
        delete orders[msg.sender];
        if(!msg.sender.send(refund)) throw;
        Refund(msg.sender, refundPercent);
        return(refund);
    }

    function withdraw(uint withdrawPercent) noEther onlyOwner returns (bool){
        if(withdrawPercent > 100) throw;
        if(now < deadline) throw;
        if(!delegate.send(this.balance*withdrawPercent/100)) throw;
        refundPercent = 100 - withdrawPercent; 
        Withdraw(msg.sender, withdrawPercent);
        return(true);
    }

    function getOrders(address buyer) constant returns (uint, string, string, string) {
        var order = orders[buyer];
        return(order.value, order.encryptedEmail, order.encryptedDeliveryAddress, order.encryptedSize);
    }
    
    function getBalance(address buyer) constant returns(uint) {
        return(orders[buyer].value);
    }
    
    function getEncryptedEmail(address buyer) constant returns(string) {
        return(orders[buyer].encryptedEmail);
    }

    function getEncryptedDeliveryAddress(address buyer) constant returns(string) {
        return(orders[buyer].encryptedDeliveryAddress);
    }

    function getEncryptedSize(address buyer) constant returns(string) {
        return(orders[buyer].encryptedSize);
    }
}
