#Purchasing cooperative
When people buy 1,000,000 of something they generally get a better price than when they buy 1. [Purchasing cooperative](https://en.   wikipedia.org/wiki/Purchasing_cooperative) have developed to take advantage of this. Where a group of people pool their money in      order to get a bulk discount of a product or service.

##Smart Contract
`pcoop.sol` implements this on the ethereum block chain. Currently the `static` directory contains an example of how the information published on the blockchain can be encrypted so only a trusted individual can read it. 

##Social Contract
This smart contract acts as an interferace through which two groups of peopel interact. Group 1 is the delegate who arranges the purchase and delivery. In this example T-Shrits, tho there are many potential applications. They can withdraw the total funds raised after a given funding time. Group 2 funds this purchase.

In the first iteration of this trust that the delegates must be handeled completely in the social contract. It is the responsibility of Group 2 to confirm that Group 1 are capable of and likely to perform their actions. 

##Usage Geth
Once the contract has been deployed you can get the ABI with `solc --abi pcoop.sol` then intialize the variable `var pcoop = web3.eth.contract($ABI$).address($ADDRESS$)`

`pcoop.buy("email","delivery address","size",{from:ethConnector.accounts[2], value: ethConnector.web3.toWei(1,"ether")})`

It is recommended that you encrypt your email, deliver address and size (assumeing this is used for tshirt bulk buy) but this shoudl be implamented in the UI. 

`pcoop.refund({from:ethConnector.accounts[3],gas:4000000})` gets a refund if you change your mind. 

`pcoop.withdraw(new BigNumber(90),{from:ethConnector.accounts[0]})` allows the delegate to withdraw a percentage of the funds raised. This is implmented to allow the bulk discount to be returned.

##Testing
1. `npm install` 
2. `cd tests` 
3. `mocha test.js`

##Disclaimer
This is an experiment. Use at your own risk. See LICENCE for more information. 
