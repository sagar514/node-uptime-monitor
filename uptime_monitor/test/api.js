/*
 * API Test
 *
 */ 

// Dependencies
var app = require('./../index'),
    assert = require('assert'),
    http = require('http'),
    config = require('./../lib/config');

// Holder for the test
var api = {};

// Helpers
var helpers = {};

helpers.makeGetRequest = function(path, callback){
    // Configure the request details
    var requestDetails = {
        'protocol': 'http:',
        'hostname': 'localhost',
        'port': config.httpPort,
        'method': 'GET',
        'path': path,
        'headers': {
            'content-Type': 'application/json'
        }
    };

    // Send the request
    var req = http.request(requestDetails, function(res){
        callback(res);
    });
    req.end();
}

// The main init() function should be able to run without throwing
api['app.init should start without throwing'] = function(done){
    assert.doesNotThrow(function(){
        app.init(function(err){
            done();
        });
    }, TypeError);
};

// Make a request to /ping
api['ping should return 200 with GET request'] = function(done){
    helpers.makeGetRequest('/ping', function(res){
        assert.equal(res.statusCode, 200);
        done();
    });
};

// Make a reuest to /api/users
api['/api/users should respond to GET with 400'] = function(done){
    helpers.makeGetRequest('/api/users', function(res){
        assert.equal(res.statusCode, 400);
        done();
    });
};

// Make a reuest to random path
api['/path/does-not-exist should respond with 404'] = function(done){
    helpers.makeGetRequest('/random/path', function(res){
        assert.equal(res.statusCode, 404);
        done();
    });
};

// Export the module
module.exports = api;