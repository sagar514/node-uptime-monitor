/*
 * Unit Tests
 *
 */

// Dependencies
var helpers = require('./../lib/helpers'),
    assert = require('assert'),
    logs = require('./../lib/logs'),
    exampleDebuggingProblem = require('./../lib/exampleDebuggingProblem');

// Holder for tests
var unit = {};

// Assert that getNumber is returning a number
unit['helpers.getNumber should return a number'] = function(done){
    var val = helpers.getNumber();
    assert.equal(typeof(val), 'number');
    done();
};

// // Assert that getNumber is returning a 1
unit['helpers.getNumber should return 1'] = function(done){
    var val = helpers.getNumber();
    assert.equal(val, 1);
    done();
};

// // Assert that getNumber is returning a 2
unit['helpers.getNumber should return 2'] = function(done){
    var val = helpers.getNumber();
    assert.equal(val, 2);
    done();
};

// logs.list should callback an array and a false error
unit['logs.list should callback a false error and an array of log file names'] = function(done){
    logs.list(true, function(err, logFileNames){
        assert.equal(err, false);
        assert.ok(logFileNames instanceof Array);
        assert.ok(logFileNames.length > 1);
        done();
    });
};

// logs.truncate should not throw if logId does not exist
unit['logs.truncate should not throw if logId does not exist'] = function(done){
    assert.doesNotThrow(function(){
        logs.truncate('logId does not exist', function(err){
            assert.ok(err);
            done();
        });
    }, TypeError);
};

// exampleDebuggingProblem script should not throw when init is called
unit['exampleDebuggingProblem script should not throw when init is called'] = function(done){
    assert.doesNotThrow(function(){
        exampleDebuggingProblem.init();
        done();
    }, TypeError);
};

// Export the tests to the runner
module.exports = unit;