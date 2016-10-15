"use strict";
var ethConnector = require('./js/eth_connector');
var simplewithdrawHelper = require('./js/simplewithdraw_helper');
var pcoopHelper = require('./js/pcoop_helper');
var assert = require('assert');
var async = require('async');
var BigNumber = require('bignumber.js');
var BuyEvent;
var WithdrawEvent; 
var RefundEvent;
var noBuyers = 0;



function expectDiffToBe(newB, oldB, diffB, msg) {
    assert(
        oldB.add(diffB).minus(newB).abs().lt(99000),
        msg + ". Expected " + diffB + " but got " + newB.minus(oldB)
    );
}

function expectNumbersEqual(expect, got, msg) {
    expect = new BigNumber(expect);
    got = new BigNumber(got);
    assert(expect.equals(got), msg + ". Expected " + expect + " but got " + got);
}

describe('Deploy Test', function() {
    var pcoop;
    var withdraw;
    before(function(done) {
        ethConnector.init('testrpc',done);
    });

    it('should deploy pcoop', function(done) {
        this.timeout(40000);
        pcoopHelper.deploy({
           _delegate: ethConnector.accounts[1],
           _design: "HASH",
           _secondsToDeadline: 2, 
           gas: 3141592
        }, function(err, contract) {
            assert.ifError(err);
            assert.ok(contract);
            pcoop = contract;
            done();
        });
    });

    it('Checking pcoop init', function(done) {       
       this.timeout(40000);
       async.series([
           function(cb) {
                   pcoop.owner(cb);
            }, function(cb) {
                   pcoop.delegate(cb);
            }, function(cb) {
                   pcoop.design(cb);
            }, function(cb) {
                   pcoop.maxPrice(cb);
            }, 
       ], function (err, results) {
            assert.ifError(err);
            assert.equal(results[0], ethConnector.accounts[0]);
            assert.equal(results[1], ethConnector.accounts[1]);
            assert.equal(results[2], "0x4841534800000000000000000000000000000000000000000000000000000000");
            assert.equal(results[3], "1000000000000000000");
            done();
        });
    });

    it('Place Order', function(done) {
       var oldBalance;
       var newBalance;
       this.timeout(40000);
       BuyEvent = pcoop.Buy();
       async.series([   
           function(cb) {
               pcoop.getBalance(ethConnector.accounts[2], {from:ethConnector.accounts[0]}, cb)
           }, function(cb) {
               ethConnector.web3.eth.getBalance(pcoop.address, cb);
           },function(cb) {
               pcoop.buy("ASDA","ASDSAD","ASDA",{from:ethConnector.accounts[2], value: ethConnector.web3.toWei(1,"ether"),gas: 3141592}, cb);
           }, function(cb) {
               ethConnector.web3.eth.getBalance(pcoop.address, cb);
           }, function(cb) {             
               pcoop.getBalance(ethConnector.accounts[2],{from:ethConnector.accounts[0]}, cb)
           }],function(err, results) {
            assert.ifError(err);
            var oldBalancePcoop = new BigNumber(results[1]);
            var newBalancePcoop = new BigNumber(results[3]);
            var oldOrder = new BigNumber(results[0]);
            var newOrder = new BigNumber(results[4]);
            expectDiffToBe(newBalancePcoop, oldBalancePcoop, 1000000000000000000, "One ether should have arrived in contract.")
            expectDiffToBe(newOrder, oldOrder, 1000000000000000000, "Should have created order for msg.sender")
            noBuyers++;
            done();
        });
      });

    it('Place Second Order', function(done) {
       var oldBalance;
       var newBalance;
       this.timeout(40000);
       BuyEvent = pcoop.Buy();
       async.series([
           function(cb) {
               pcoop.getBalance(ethConnector.accounts[3], {from:ethConnector.accounts[0],gas: 3141592}, cb)
           }, function(cb) {
               ethConnector.web3.eth.getBalance(pcoop.address, cb);
           },function(cb) {
               pcoop.buy("ASDA","ASDSAD","ASDA",{from:ethConnector.accounts[3], value: ethConnector.web3.toWei(1,"ether"),gas: 3141592}, cb);
           }, function(cb) {
               ethConnector.web3.eth.getBalance(pcoop.address, cb);
           }, function(cb) {
               pcoop.getBalance(ethConnector.accounts[3], {from:ethConnector.accounts[0]}, cb)
           }],function(err, results) {
            assert.ifError(err);
            var oldBalancePcoop = new BigNumber(results[1]);
            var newBalancePcoop = new BigNumber(results[3]);
            var oldOrder = new BigNumber(results[0]);
            var newOrder = new BigNumber(results[4]);
            expectDiffToBe(newBalancePcoop, oldBalancePcoop, 1000000000000000000, "One ether should have arrived in contract.")
            expectDiffToBe(newOrder, oldOrder, 1000000000000000000, "One ether should have arrived in contract.")
            noBuyers++;
            done();
        });
      });

    it('Get Full Refund', function(done) {
        var oldBalance;
        var newBalance;
        this.timeout(40000);
        RefundEvent = pcoop.Refund();
        async.series([
           function(cb) {
               pcoop.getBalance(ethConnector.accounts[3], cb)
           }, function(cb) {
               ethConnector.web3.eth.getBalance(pcoop.address, cb);
           },function(cb) {
               pcoop.refund({from:ethConnector.accounts[3],gas:3141592}, cb);
           }, function(cb) {
               ethConnector.web3.eth.getBalance(pcoop.address, cb);
           }, function(cb) {
               pcoop.getBalance(ethConnector.accounts[3],{from:ethConnector.accounts[0]},  cb)
           }],function(err, results) {
            assert.ifError(err);        
            var oldBalancePcoop = new BigNumber(results[1]);
            var newBalancePcoop = new BigNumber(results[3]);
            var oldOrder = new BigNumber(results[0]);
            var newOrder = new BigNumber(results[4]);
            expectDiffToBe(newBalancePcoop, oldBalancePcoop, -1000000000000000000, "One ether should have left the contract.")
            expectDiffToBe(newOrder, oldOrder, -1000000000000000000, "One ether should have arrived in contract.")
            noBuyers--;
            done();
           });
        });


    it('Fail to get Refund', function(done) {
        var oldBalance;
        var newBalance;
        this.timeout(40000);
        RefundEvent = pcoop.Refund();
        async.series([
            function(cb) {
                ethConnector.web3.eth.getBalance(pcoop.address, cb);
            }, function(cb) {
                pcoop.refund({from:ethConnector.accounts[4],gas: 3141592}, cb);
            }, function(cb) {
                ethConnector.web3.eth.getBalance(pcoop.address, cb);
            }] , function(err, results) {
            assert.ifError(err);
            var oldBalance = new BigNumber(results[0]);
            var newBalance = new BigNumber(results[2]);         
            expectDiffToBe(newBalance, oldBalance, 0, "This send should failed but contract balance changed")
            done();
           });
        });

    it('TimeOut to allow withdraw *SHOULD FAIL*', function(done) {
        this.timeout(2000);
    });    

    it('Withdraw', function(done) {
        var oldBalance;
        var newBalance;
        this.timeout(40000);
        WithdrawEvent = pcoop.Withdraw();
        async.series([
            function(cb) {
                ethConnector.web3.eth.getBalance(pcoop.address, cb);
            }, function(cb) {
                pcoop.withdraw(new BigNumber(90),{from:ethConnector.accounts[0]}, cb);
            }, function(cb) {
                ethConnector.web3.eth.getBalance(pcoop.address, cb);
            }, function(cb) {
                pcoop.refundPercent(cb);
            }] , function(err, results) {
            assert.ifError(err);
            oldBalance = new BigNumber(results[0]);
            newBalance = new BigNumber(results[2]);
            assert.equal(results[3], 10, "refund Percentage not set correctly");
            expectDiffToBe(newBalance, oldBalance, noBuyers*-1000000000000000000*90/100, "Witdraw failed to change bal")    
            done();
           });
        });

    it('Get 10% Refund', function(done) {
        var oldBalance;
        var newBalance;
        this.timeout(40000);
        RefundEvent = pcoop.Refund();
        async.series([   
            function(cb) {
                ethConnector.web3.eth.getBalance(pcoop.address, cb);
            }, function(cb) {
                pcoop.refund({from:ethConnector.accounts[2], gas:1000000}, cb);
            }, function(cb) {
                ethConnector.web3.eth.getBalance(pcoop.address, cb);
            }] , function(err, results) {
            assert.ifError(err);
            oldBalance = new BigNumber(results[0]);
            newBalance = new BigNumber(results[2]);
            expectDiffToBe(newBalance, oldBalance, -1000000000000000000*10/100, "10% refund failed.")
            done();
           });
        });


/*
// ommiting for now due to https://github.com/ethereum/web3.js/issues/434
    it('Check Buy Event', function(done) {
       this.timeout(40000);
       BuyEvent.watch(function(err,watch) {
           assert.ifError(err);
           assert.equal(watch.args.encryptedEmail, "0x41534441", "email Incorrect");
           assert.equal(watch.args.encryptedDeliveryAddress, "0x415344534144", "Address Incorrect");
           assert.equal(watch.args.encryptedSize , "0x41534441" , "Size incorrect");
           done();
       });
    });


    it('Check Withdraw Event', function(done) {
       this.timeout(40000);
       WithdrawEvent.watch(function(err,watch) {
           assert.ifError(err);
           console.log(watch);
           done();
       });
    });


    it('Check Refund Event', function(done) {
       this.timeout(40000);
       RefundEvent.watch(function(err,watch) {
           assert.ifError(err);
           console.log(watch.args);
           console.log(ethConnector.accounts[2]);
//           assert.equal(watch.args.buyer, ethConnector.accounts[2], "refund Address Incorrect");
//           this seems like another events bug in web3. I will raise it. once i confirm
           done();
       });
    });
*/
});
