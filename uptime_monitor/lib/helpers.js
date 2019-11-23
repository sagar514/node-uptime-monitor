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

// Sample for testing (Simply return a number)
helpers.getNumber = function(){
    return 1;
};

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
helpers.getTemplate = function(templateName, data, callback){
    templateName = typeof(templateName) == "string" && templateName.length > 0 ? templateName : false;
    data = typeof(data) == "object" && data !== null ? data : {};

    if(templateName){
        var templateDir = path.join(__dirname + "/../templates/");

        fs.readFile(templateDir+templateName+".html", "utf8", function(err, templateString){
            if(!err && templateString && templateString.length > 0){
                var finalString = helpers.interpolate(templateString, data);
                callback(false, finalString);
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

// Take a given string and data object, find/replace all keys within it
helpers.interpolate = function(str, data){
    str = typeof(str) == "string" && str.length > 0 ? str : "";
    data = typeof(data) == "object" && data !== null ? data : {};
    
    for(var keyName in config.templateGlobals){
        if(config.templateGlobals.hasOwnProperty(keyName)){
            data["global."+keyName] = config.templateGlobals[keyName];
        }
    }
    
    for(var key in data){
        var replace = data[key],
            find = "{"+key+"}";

        str = str.replace(find, replace);
    }

    return str;
}

// Function to add universal (header and footer) templates
helpers.addUniversalTemplates = function(str, data, callback){
    str = typeof(str) == "string" && str.length > 0 ? str : "";
    data = typeof(data) == "object" && data !== null ? data : {};
    
    // get header template
    helpers.getTemplate("_header", data, function(err, headerTemplateString){
        if(!err && headerTemplateString){
            helpers.getTemplate("_footer", data, function(err, footerTemplateString){
                if(!err && footerTemplateString){
                    var fullTemplateString = headerTemplateString + str + footerTemplateString;
                    callback(false, fullTemplateString);
                }
                else{
                    callback("Error could not get footer template");
                }
            });
        }
        else{
            callback("Error could not get header template");
        }
    });
}

// Get static assets
helpers.getStaticAsset = function(fileName, callback){
    fileName = typeof(fileName) == "string" && fileName.length > 0 ? fileName : false;

    if(fileName){
        var publicDir = path.join(__dirname + "/../public/");

        fs.readFile(publicDir+fileName, "utf8", function(err, data){
            if(!err && data){
                callback(false, data);
            }
            else{
                callback("Error could not get specified file");
            }
        });
    }
    else{
        callback("A valid file name is not provided");
    }
}

// Export helpers
module.exports = helpers;