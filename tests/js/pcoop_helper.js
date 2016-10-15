/*jslint node: true */
"use strict";
var async = require('async');
var ethConnector = require('./eth_connector');

exports.deploy = function(opts,cb) {
    var compilationResult;
    var pcoop;
    return async.waterfall([
        function(cb) {
            ethConnector.loadSol("../pcoop.sol", cb);
        },
        function(src, cb) {
            ethConnector.applyConstants(src, opts, cb);
        },
        function(src, cb) {
            ethConnector.compile(src, cb);
        },
        function(result, cb) {
            compilationResult = result;
            ethConnector.deploy(compilationResult.pcoop.interface,
                compilationResult.pcoop.bytecode,
                0,
                0,
                opts._delegate,
                opts._design,
                opts._secondsToDeadline,
                cb);
        }
   ], function(err, _pcoop) {
        pcoop = _pcoop;
        if (err) return cb(err);
        cb(null,pcoop, compilationResult);
    });
};
