/*
 *  Primary file for API
 */ 

// Dependencies
var http = require('http'),
    https = require('https'),
    url = require('url'),
    StringDecoder = require('string_decoder').StringDecoder,
    config = require('./lib/config'),
    fs = require('fs'),
    handlers = require('./lib/handlers'),
    _data = require('./lib/data'),
    helpers = require('./lib/helpers');

// ============= Functions to test file related functionality =============
// _data.create('test', 'tempFile', {'foo': 'bar'}, function(err){
//     console.log(err);
// });

// _data.read('users', '7709140714', function(err, data){
//     console.log(data);
//     console.log('Error', err, 'Data' + data);
// });

// _data.update('test', 'tempFile', {'fuzz': 'buzz'}, function(err){
//     console.log(err);
// });

// _data.delete('test', 'tempFile', function(err){
//     console.log(err);
// });

helpers.sendTwilioSMS('7709140714', 'hi kukku', function(error){
    console.log("Error " + error);
});

// console.log(config);
// Server should respond to all requests with string
var httpServer = http.createServer(function(req, res){
    unifiedServer(req, res);
});

// Start the server and make it to listen at port 3000
httpServer.listen(config.httpPort, function(){
    console.log(`Server is listening on PORT ${config.httpPort} in ${config.envName} mode`);
});


// Https Server
var httpsServerOptions = {
    'key': fs.readFileSync('./https/server.key'),
    'cert': fs.readFileSync('./https/server.cert'),
    'agent': false
};

var httpsServer = https.createServer(httpsServerOptions, function(req, res){
    unifiedServer(req, res);
});

// Start the https server
httpsServer.listen(config.httpsPort, function(){
    console.log(`Server is listening on PORT ${config.httpsPort} in ${config.envName} mode`);
});

// Common HTTP and HTTPS server
var unifiedServer = function(req, res){
    // console.log(req);
    
    // Get the URL and parse it
    var parsedUrl = url.parse(req.url, true);
    // console.log(parsedUrl);

    // Get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get query string as an object
    var queryString = parsedUrl.query;

    // Get the method
    var method = req.method.toLowerCase();

    // Get the headers as an object
    var headers = req.headers;

    // Get the payload, if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function(data){
        buffer += decoder.write(data);
    });

    req.on('end', function(){
        buffer += decoder.end();

        // Choose handler
        var choosenHandler = typeof(routes[trimmedPath]) !== 'undefined' ? routes[trimmedPath] : handlers.notFound;

        // Construct data to send to handler
        var data = {
            trimmedPath: trimmedPath,
            queryString: queryString,
            method: method,
            headers: headers,
            payload: helpers.parseJsonToObject(buffer)
        };

        choosenHandler(data, function(statusCode, payload){

            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            payload = typeof(payload) == 'object' ? payload : {};
            
            var payloadString = JSON.stringify(payload);
            
            // Send the response
            res.setHeader('content-type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            // Log
            console.log('Response', statusCode, payloadString);
        });


        // Log the request path
        // console.log(`Request path: ${trimmedPath} with method: ${method} with query string parameters: `, queryString);
        // console.log(`Request headers: `, headers);
        // console.log(`Request payload: `, buffer);
    });

}

// Define Routes
var routes = {
    'sample': handlers.sample,
    'ping': handlers.ping,
    'users': handlers.users,
    'tokens': handlers.tokens,
    'checks': handlers.checks
};