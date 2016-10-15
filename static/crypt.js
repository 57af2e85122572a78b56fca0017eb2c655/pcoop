var eccrypto = require("eccrypto");
var crypto = require("crypto");
var async = require('async');
var tmp = "second";

var privateKey = crypto.randomBytes(32);
var publicKey = eccrypto.getPublic(privateKey);



function encrypt(msg, pubKey, cb) { 
    eccrypto.encrypt(pubKey, Buffer(msg)).then(function(encrypted) {
        return cb(encrypted);
    });        
}

function decrypt (encrypted) { 
        eccrypto.decrypt(privateKey, encrypted).then(function(plaintext) {
        console.log(plaintext.toString());
        return plaintext.toString();
       });
};

async.series([
    function(cb) {
        console.log("first");
		tmp = encrypt( "asdfdsf", publicKey,decrypt);
                cb();
    }], function(cb) {
        console.log(tmp);
    });
