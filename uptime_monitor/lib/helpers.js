/*
 * Helpers function
 *
 */ 

// Dependencies
var crypto = require('crypto'),
    config = require('./config'),
    queryString = require('querystring'),
    https = require('https'),
    fs = require('fs'),
    path = require('path');

// helpers container
var helpers = {};

// Create SHA256 hash
helpers.hash = function(str){
    if(typeof(str) == "string" && str.trim().length > 0){
        var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    }
    else{
        return false;
    }
}

// Parse JSON string to object
helpers.parseJsonToObject = function(str){
    try{
        return JSON.parse(str);
    }
    catch(e){
        return {};
    }
}

// Create random string of given length
helpers.createRandomString = function(strLength){
    
    if(typeof(strLength) == 'number' && strLength > 0){
        var possibleCharacters = "abcdefghijklmnopqrstuvwxyz0123456789";
        var str = '';

        for(i = 0; i < strLength; i++){
            var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            str += randomCharacter;
        }

        return str;
    }
    else{
        return false;
    }
}

// Send SMS via Twilio
helpers.sendTwilioSMS = function(phone, msg, callback){

    // validate parameters
    var phone = typeof(phone) == "string" && phone.trim().length == 10 ? phone.trim() : false,
        msg = typeof(msg) == "string" && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;

    if(phone && msg){

        // Configure request payload
        var payload = {
            'From': config.twilio.fromPhone,
            'To': '+91' + phone,
            'Body': msg
        };

        // Stringify the payload
        var stringPayload = queryString.stringify(payload);

        // Configure the request details
        var requestDetails = {
            'protocol': 'https:',
            'hostname': 'api.twilio.com',
            'method': 'POST',
            'path': '2010-04-01/Accounts/' + config.twilio.accoundSid + '/Messages.json',
            'auth': config.twilio.accoundSid + ':' + config.twilio.authToken,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload)
            }
        };

        // Instatntiate request object
        var req = https.request(requestDetails, function(res){
            // Status of request sent
            var status = res.statusCode;

            // Callback succesfully if request went through
            if(status == 200 || status == 201){
                callback(false);
            }
            else{
                callback('Status code ' + status);
            }
        });

        // Bind to the error event so it doesn't get thrown
        req.on('error', function(e){
            callback(e);
        });

        // Add the payload
        req.write(stringPayload);

        // End the request
        req.end();

    }
    else{
        callback("Required parameters were missing or invalid");
    }
}

// Function to read templates
helpers.getTemplate = function(templateName, callback){
    templateName = typeof(templateName) == "string" && templateName.length > 0 ? templateName : false;

    if(templateName){
        var templateDir = path.join(__dirname + "/../templates/");

        fs.readFile(templateDir+templateName+".html", "utf8", function(err, templateString){
            if(!err && templateString && templateString.length > 0){
                callback(false, templateString);
            }
            else{
                callback("Error: No template found");
            }
        });
    }
    else{
        callback("Error: Valid template name is not specified");
    }
}


// Export helpers
module.exports = helpers;