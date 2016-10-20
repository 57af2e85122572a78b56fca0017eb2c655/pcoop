#Purchasing cooperative
When people buy 1,000,000 of something they generally get a better price than when they buy 1. [Purchasing cooperative](https://en.wikipedia.org/wiki/Purchasing_cooperative) has been developed to take advantage of this. Using this contract a group of people can pool their money in order to get a bulk discount on a product or service.

##Smart Contract
`pcoop.sol` implements this on the ethereum blockchain. Currently the `static` directory contains an example of how the information published on the blockchain can be encrypted so only a trusted individual can read it. 

##Social Contract
This smart contract acts as an interface through which two groups of people interact. Group 1 are the delegates that arrange the purchase and delivery. They can withdraw the total funds raised after a given funding time. Group 2 funds this purchase. T-Shirts are used as an example, but there are almost infinite potential applications.

In the first iteration, the delegates must be handled completely in the social contract. It is the responsibility of Group 2 to confirm that Group 1 are trustworthy and capable of performing their actions. 

##Using Geth 
Once the contract has been deployed you can get the ABI with `solc --abi pcoop.sol` then initialize the variable `var pcoop = web3.eth.contract($ABI$).address($ADDRESS$)`

`pcoop.buy("email","delivery address","size",{from:ethConnector.accounts[2], value: ethConnector.web3.toWei(1,"ether")})`

It is recommended that you encrypt your email, delivery address and size (for T-shirts) and any personal data submitted using this Dapp, this will eventually be automatically implemented in the UI. 

`pcoop.refund({from:ethConnector.accounts[3],gas:4000000})` gets a refund if you change your mind. 

`pcoop.withdraw(new BigNumber(90),{from:ethConnector.accounts[0]})` allows the delegate to withdraw a percentage of the funds raised. This is implemented to allow the bulk discount to be returned.

##Testing
1. `npm install` 
2. `cd tests` 
3. `mocha test.js`

##Disclaimer
This is an experimental Dapp. Use at your own risk. See LICENSE for more information. 
