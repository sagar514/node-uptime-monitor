/*
 * Workers relared tasks
 *
 */ 

// Dependencies
var http = require('http'),
    https = require('https'),
    url = require('url'),
    config = require('./config'),
    fs = require('fs'),
    _data = require('./data'),
    helpers = require('./helpers'),
    path = require('path');

// Instantiate worker object
var workers = {};

// Lookup all checks, get their data and send to validator
workers.gatherAllChecks = function(){
    // Get all checks
    _data.list("checks", function(err, checks){
        if(!err && checks && checks.length > 0){
            checks.forEach(function(check){
                _data.read("checks", check, function(err, originalCheckData){
                    if(!err && originalCheckData){
                        // Pass check-data to validator
                        workers.validateCheckData(originalCheckData);
                    }
                    else{
                        console.log("Error reading one of the check data");
                    }
                });
            });
        }
        else{
            console.log("Error: Checks not found");
        }
    });
}
// Sanity-check the check-data
workers.validateCheckData = function(checkData = originalCheckData){

    checkData = typeof(checkData) == "object" && checkData !== null ? checkData : {};
    checkData.checkId = typeof(checkData.checkId) == "string" && checkData.checkId.length == 20 ? checkData.checkId : false;
    checkData.userPhone = typeof(checkData.userPhone) == "string" && checkData.userPhone.length == 10 ? checkData.userPhone : false;    
    checkData.protocol = typeof(checkData.protocol) == "string" && ["http", "https"].indexOf(checkData.protocol) > -1 ? checkData.protocol : false,
    checkData.url = typeof(checkData.url) == "string" && checkData.url.length > 0 ? checkData.url : false,
    checkData.method = typeof(checkData.method) == "string" && ["post", "get", "put", "delete"].indexOf(checkData.method) > -1 ? checkData.method : false,
    checkData.successCodes = typeof(checkData.successCodes) == "object" && checkData.successCodes instanceof Array && checkData.successCodes.length > 0 ? checkData.successCodes : false,
    checkData.timeOutSeconds = typeof(checkData.timeOutSeconds) == "number" && checkData.timeOutSeconds >= 1 && checkData.timeOutSeconds <= 5 ? checkData.timeOutSeconds : false;

    // Set keys if check comes in picture for the first time
    checkData.state = typeof(checkData.state) == "string" && ["up", "down"].indexOf(checkData.state) > -1 ? checkData.state : 'down';
    checkData.lastChecked = typeof(checkData.lastChecked) == "number" && checkData.lastChecked > 0 ? checkData.lastChecked : false;

    if(checkData.checkId && checkData.userPhone && checkData.protocol && checkData.url && checkData.method && checkData.successCodes && checkData.timeOutSeconds){
        workers.performCheck(checkData);
    }
    else{
        console.log("Error: One of the check is not properly formatted. Skipping it...");
    }
}

// Perform check
workers.performCheck = function(checkData){

    // Prepare initial outcome
    var checkOutcome = {
        "error": false,
        "responseCode": false
    }

    // Mark check outcome is sent or not
    var outcomeSent = false;

    // Parse hostname and path out of checkData
    var parsedUrl = url.parse(checkData.protocol+"://"+checkData.url, true),
        hostName = parsedUrl.hostname,
        path = parsedUrl.path;                              // We are using path and not pathname, becoz we want querystring

    // Construct the request
    var requestDetails = {
        "protocol": checkData.protocol+":", 
        "hostname": hostName,
        "method": checkData.method,
        "path": path,
        "timeout": checkData.timeOutSeconds * 1000
    };

    // Instantiate request object
    var _moduleToUse = checkData.protocol == "http" ? http : https;

    var req = _moduleToUse.request(requestDetails, function(res){
        
        var status = res.statusCode;

        checkOutcome.responseCode = status;
        if(!outcomeSent){
            workers.processCheckOutcome(checkData, checkOutcome);
            outcomeSent = true;
        }
    });

    // Bind to error event so it doesn't get thrown
    req.on("error", function(e){
        checkOutcome.error = {
            "error": true,
            "value": e
        }

        if(!outcomeSent){
            workers.processCheckOutcome(checkData, checkOutcome);
            outcomeSent = true;
        }
    
    });

    // Bind to timeout event
    req.on("timeout", function(e){
        checkOutcome.error = {
            "error": true,
            "value": "timeout"
        }

        if(!outcomeSent){
            workers.processCheckOutcome(checkData, checkOutcome);
            outcomeSent = true;
        }
    
    });

    // End request
    req.end();

}

// Process check outcome and update the check data as needed and trigger alert to user
workers.processCheckOutcome = function(checkData, checkOutcome){

    // Mark if check-state is change
    var state = !checkOutcome.error && checkOutcome.responseCode && checkData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down';

    // Decide if alert is needed
    var requireAlert = checkData.lastChecked && checkData.state != state ? true : false;

    // Update check-data
    checkData.state = state;
    checkData.lastChecked = Date.now();
    
    _data.update("checks", checkData.checkId, checkData, function(err){
        if(!err){
            // Send alert if required
            if(requireAlert){
                workers.alertUser(checkData);
            }
            else{
                console.log("Check outcome is not changed, no alert is needed");
            }
        }
        else{
            console.log("Error trying to update one of check-data");
        }
    });
}

// Alert user via Twilio SMS API
workers.alertUser = function(checkData){
    var msg = "Alert: Your check for " + checkData.method.toUpperCase() + checkData.protocol + "://" + checkData.url + " is " + checkData.state + " now."
    helpers.sendTwilioSMS(checkData.userPhone, msg, function(err){
        if(!err){
            console.log("Success: User was alerted, via sms", msg);
        }
        else{
            console.log("Error: Could not alert user");
        }
    });    
}

// Timer to execute worker-process every minute
workers.loop = function(){
    setInterval(function(){
        workers.gatherAllChecks();
    }, 1 * 5 * 1000);
}

// Init script
workers.init = function(){
    // Execute all checks immediately
    workers.gatherAllChecks();

    // Execute checks in loop for later on
    workers.loop();
}

// Export module
module.exports = workers;