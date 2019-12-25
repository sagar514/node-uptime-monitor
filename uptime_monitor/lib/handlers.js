/*
 * Request Handlers
 *
 */ 

// Dependencies
// var _data = require('./data'),
var _data = require('./data-db'),
    helpers = require('./helpers'),
    config = require('./config'),
    _url = require('url'),
    dns = require('dns'),
    _performance = require('perf_hooks').performance,
    util = require('util'),
    debbug = util.debug('performance');

// Define handlers
var handlers = {};

/*
 * Web Handlers
 *
 */ 

handlers.index = function(data, callback){

    if(data.method == "get"){

        var templateData = {
            'head.title': 'Uptime Monitoring - Made Simple',
            'head.description': 'We offer free, simple monitoring for HTTP/HTTPS sites. When your site goes down, we will notify you.',
            'body.class': 'index'
        };

        helpers.getTemplate("index", templateData, function(err, str){
            if(!err && str){
                helpers.addUniversalTemplates(str, templateData, function(err, templateString){
                    if(!err && templateString){
                        callback(200, templateString, "html");
                    }
                    else{
                        callback(500, undefined, "html");
                    }
                });
            }
            else{
                callback(500, undefined, "html");
            }
        });
    }
    else{
        callback(405, undefined, "html");
    }
}

// Account Create
handlers.accountCreate = function(data, callback){
    if(data.method == "get"){

        var templateData = {
            'head.title': 'Create Your Account',
            'head.description': 'Signup is easy and only takes a few seconds.',
            'body.class': 'accountCreate'
        };

        helpers.getTemplate("accountCreate", templateData, function(err, str){
            if(!err && str){
                helpers.addUniversalTemplates(str, templateData, function(err, templateString){
                    if(!err && templateString){
                        callback(200, templateString, "html");
                    }
                    else{
                        callback(500, undefined, "html");
                    }
                });
            }
            else{
                callback(500, undefined, "html");
            }
        });
    }
    else{
        callback(405, undefined, "html");
    }
}

// Session Create
handlers.sessionCreate = function(data, callback){
    if(data.method == "get"){

        var templateData = {
            'head.title': 'Login To Your Account',
            'head.description': 'Enter Your Phone Number And Password',
            'body.class': 'sessionCreate'
        };

        helpers.getTemplate("sessionCreate", templateData, function(err, str){
            if(!err && str){
                helpers.addUniversalTemplates(str, templateData, function(err, templateString){
                    if(!err && templateString){
                        callback(200, templateString, "html");
                    }
                    else{
                        callback(500, undefined, "html");
                    }
                });
            }
            else{
                callback(500, undefined, "html");
            }
        });
    }
    else{
        callback(405, undefined, "html");
    }
}

// Session Delete
handlers.sessionDeleted = function(data, callback){
    
    if(data.method == "get"){

        var templateData = {
            'head.title': 'Logged Out',
            'head.description': 'You have been logged out of your account.',
            'body.class': 'sessionDeleted'
        };

        helpers.getTemplate("sessionDeleted", templateData, function(err, str){
            if(!err && str){
                helpers.addUniversalTemplates(str, templateData, function(err, templateString){
                    if(!err && templateString){
                        callback(200, templateString, "html");
                    }
                    else{
                        callback(500, undefined, "html");
                    }
                });
            }
            else{
                callback(500, undefined, "html");
            }
        });
    }
    else{
        callback(405, undefined, "html");
    }
}

// Account Edit
handlers.accountEdit = function(data, callback){
    
    if(data.method == "get"){

        var templateData = {
            'head.title': 'Account Settings',
            'body.class': 'accountEdit'
        };

        helpers.getTemplate("accountEdit", templateData, function(err, str){
            if(!err && str){
                helpers.addUniversalTemplates(str, templateData, function(err, templateString){
                    if(!err && templateString){
                        callback(200, templateString, "html");
                    }
                    else{
                        callback(500, undefined, "html");
                    }
                });
            }
            else{
                callback(500, undefined, "html");
            }
        });
    }
    else{
        callback(405, undefined, "html");
    }
}

// Favicon
handlers.favicon = function(data, callback){
    if(data.method == "get"){
        helpers.getStaticAsset("favicon.ico", function(err, data){
            if(!err && data){
                callback(200, data, "favicon");
            }
            else{
                callback(500);
            }
        });
    }
    else{
        callback(405);
    }
}

// Public Assets
handlers.public = function(data, callback){
    if(data.method == "get"){
        
        // var trimmedAssetName = data.trimmedPath.replace("public/", "").trim();
        var trimmedAssetName = data.trimmedPath.split("public/").pop().trim();

        if(trimmedAssetName.length > 0){
            helpers.getStaticAsset(trimmedAssetName, function(err, data){
                if(!err && data){
                    var contentType = "plain";

                    if(trimmedAssetName.indexOf(".css") > -1){
                        contentType = "css";
                    }

                    if(trimmedAssetName.indexOf(".png") > -1){
                        contentType = "png";
                    }

                    if((trimmedAssetName.indexOf(".jpg") > -1) || (trimmedAssetName.indexOf(".jpeg") > -1)){
                        contentType = "jpeg";
                    }

                    if(trimmedAssetName.indexOf(".ico") > -1){
                        contentType = "favicon";
                    }

                    callback(200, data, contentType);
                }
                else{
                    callback(404);
                }
            });
        }
        else{
            callback(404);
        }
    }
    else{
        callback(405);
    }
}


/*
 * API Handlers
 *
 */ 

// Error handler
handlers.exampleError = function(data, callback){
    var err = new Error('Example error');
    throw(err);
}

// Sample handler
handlers.sample = function(data, callback){
    callback(406, {'name': 'sample handler'});
}

// Ping handler
handlers.ping = function(data, callback){
    callback(200);
}

// 404 handler
handlers.notFound = function(data, callback){
    callback(404);
}

// Users handler
handlers.users = function(data, callback){

    var allowed_methods = ['get', 'post', 'put', 'delete'];

    if(allowed_methods.indexOf(data.method) > -1){
        handlers._users[data.method](data, callback);
    }
    else{
        callback(405);
    }
}

// Container for users submethods
handlers._users = {};

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = function(data, callback){

    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName : false,
        lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName : false,
        phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone : false,
        password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password : false,
        tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    if(firstName && lastName && phone && password && tosAgreement){

        // Check if user already exists
        _data.read('users', phone, function(err, data){
            if(err){

                var hashedPassword = helpers.hash(password);

                if(hashedPassword){
                    // User Object
                    var userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword': hashedPassword,
                        'tosAgreement': tosAgreement
                    };

                    // Create User
                    _data.create('users', phone, userObject, function(err){
                        if(err){
                            callback(500, {'Error': 'Could not create new user'});
                        }
                        else{
                            callback(200);
                        }
                    });
                }
                else{
                    callback(500, {'Error': 'Could not hash user password'});
                }

            }else{
                callback(400, {'Error': 'A user with that number already exists'});
            }
        })

    }else{
        callback(400, {'Error': 'Missing required fields'});
    }

}

// Users - get
// Required data: phone
// Optional data: none
handlers._users.get = function(data, callback){
    var phone = typeof(data.queryString.phone) == 'string' && data.queryString.phone.trim().length == 10 ? data.queryString.phone.trim() : false;

    if(phone){

        var token = typeof(data.headers.token) == "string" ? data.headers.token : false;

        handlers._tokens.verifyToken(token, phone, function(isValidToken){
            
            if(isValidToken){

                _data.read('users', phone, function(err, data){
                    if(!err && data){
                        // Remove password field
                        delete data.hashedPassword;
                        callback(200, data);
                    }
                    else{
                        callback(200, {"Error": "User with that phone doesn't exist"});
                    }
                });
            }
            else{
                callback(400, {"Error": "Missing token in headers or token is invalid"});
            }
        });

    }
    else{
        callback(400, {'Error': 'Missing required fields'});
    }
}

// Users - put
// Required data: phone
// Optional data: anyone out of (firstName, lastName, password)
handlers._users.put = function(data, callback){

    var phone = typeof(data.payload.phone) == "string" && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    if(phone){
        var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName : false,
            lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName : false,
            password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password : false;

        if(firstName || lastName || password){
            
            var token = typeof(data.headers.token) == "string" ? data.headers.token : false;

            handlers._tokens.verifyToken(token, phone, function(isValidToken){
                if(isValidToken){

                    _data.read("users", phone, function(err, userData){
                        if(!err && userData){
                            
                            var hashedPassword = helpers.hash(password);
        
                            if(hashedPassword){
        
                                if(firstName){
                                    userData.firstName = firstName;
                                }
        
                                if(lastName){
                                    userData.lastName = lastName;
                                }
        
                                if(password){
                                    userData.hashedPassword = hashedPassword;
                                }
        
                                _data.update("users", phone, userData, function(err){
                                    if(! err){
                                        callback(200);
                                    }
                                    else{
                                        callback(500, {"Error": "Could not update user"});
                                    }
                                });
                            
                            }
                            else{
                                callback(500, {"Error": "Could not hash password"});
                            }
        
                        }
                        else{
                            callback(404, {"Error": "User with that phone not exist"});
                        }
                    });
                }
                else{
                    callback(400, {"Error": "Missing token in headers or token is invalid"}); 
                }
            });

        }
        else{
            callback(400, {"Error": "Missing user data to update"});
        }
        
    }
    else{
        callback(400, {"Error": "Missing required fields"});
    }
}

// Users - delete
// Required data: phone
// Optional data: none
handlers._users.delete = function(data, callback){
    var phone = typeof(data.queryString.phone) == 'string' && data.queryString.phone.trim().length == 10 ? data.queryString.phone.trim() : false;

    if(phone){

        var token = typeof(data.headers.token) == "string" ? data.headers.token : false;

        handlers._tokens.verifyToken(token, phone, function(isValidToken){
            if(isValidToken){
                _data.read('users', phone, function(err, data){
                    if(!err && data){
                        
                        _data.delete("users", phone, function(err){
                            if(! err){
                                // Delete all user related checks
                                var userChecks = typeof(data.checks) == "object" && data.checks instanceof Array ? data.checks : [],
                                    checksToDelete = userChecks.length;

                                if(checksToDelete > 0){
                                    var deletionError = false,
                                        deletedChecks = 0;

                                    userChecks.forEach(function(checkId){
                                        _data.delete("checks", checkId, function(err){
                                            if(err){
                                                deletionError = true; 
                                            }
                                            
                                            deletedChecks++;

                                            if(checksToDelete == deletedChecks){
                                                if(! deletionError){
                                                    callback(200);
                                                }
                                                else{
                                                    callback(500, {"Error": "Error attempting to delete user's check. All checks may not have been deleted."});
                                                }
                                            }
                                        });
                                    });
                                }
                                else{
                                    callback(200);
                                }
                            }
                            else{
                                callback(500, {"Error": "Could not delete specified user"});
                            }
                        });
                    }
                    else{
                        callback(404, {"Error": "Could not find specified user"});
                    }
                });
            }
            else{
                callback(400, {"Error": "Missing token in headers or token is invalid"});
            }
        });

    }
    else{
        callback(400, {'Error': 'Missing required fields'});
    }
}

// Tokens handler
handlers.tokens = function(data, callback){

    var allowed_methods = ['get', 'post', 'put', 'delete'];

    if(allowed_methods.indexOf(data.method) > -1){
        handlers._tokens[data.method](data, callback);
    }
    else{
        callback(405);
    }
}

// Tokens submethods container
handlers._tokens = {};

// Tokens - post
// Required data: phone, password
// Optional data: none
handlers._tokens.post = function(data, callback){

    // _performance.mark('entered function');

    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone : false,
        password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password : false;

    // _performance.mark('inputs validated');

    if(phone && password){

        // _performance.mark('beginning user lookup');

        _data.read("users", phone, function(err, userData){

            // _performance.mark('user lookup completed');

            if(!err && userData){

                // _performance.mark('beginning hashing password');
                var hashedEnteredPassword = helpers.hash(data.payload.password);
                // _performance.mark('password hashing complete');

                if(hashedEnteredPassword == userData.hashedPassword){

                    // _performance.mark('creating data for token');
                    var tokenId = helpers.createRandomString(20),
                        expires = Date.now() + (1 * 60 * 60 * 1000),
                        tokenObject = {
                            'user': userData.phone,
                            'token': tokenId,
                            'expires': expires
                        };

                    // Store the token
                    // _performance.mark('beginning storing token');
                    _data.create("tokens", tokenId, tokenObject, function(err){
                        
                        // _performance.mark('token storing complete');

                        // Gather all measurements
                        // _performance.measure('Beginning to end', 'entered function', 'token storing complete');
                        // _performance.measure('Validating user input', 'entered function', 'inputs validated');
                        // _performance.measure('User lookup', 'beginning user lookup', 'user lookup completed');
                        // _performance.measure('Password hashing', 'beginning password hashing', 'password hashing complete');
                        // _performance.measure('Token data creation', 'creating data for token', 'beginning storing token');
                        // _performance.measure('Token storing', 'beginning storing token', 'token storing complete');

                        // Log out all measurements
                        // var measurements = _performance.getEntriesByType('measure');
                        // measurements.forEach(function(measurement){
                        //     debug('\x1b[33m%s\x1b[0m', measurement.name+' '+measurement.duration);
                        // });

                        if(!err){
                            callback(200, tokenObject);
                        }
                        else{
                            callback(500, {"Error": "Could not create token"});
                        }
                    });
                    
                }
                else{
                    callback(200, {"Error": "Password mismatch"});
                }
            }
            else{
                callback(404, {"Error": "Could not find user with that phone"})
            }
        });
    }
    else{
        callback(400, {"Error": "Missing required fields"});
    }
}

// Tokens - get
// Required data: id
// Optional data: none
handlers._tokens.get = function(data, callback){
    var id = typeof(data.queryString.id) == 'string' && data.queryString.id.trim().length == 20 ? data.queryString.id.trim() : false;

    if(id){
        _data.read('tokens', id, function(err, tokenData){
            if(!err && tokenData){
                callback(200, tokenData);
            }
            else{
                callback(404);
            }
        });
    }
    else{
        callback(400, {'Error': 'Missing required field'});
    }
}

// Tokens - put
// Required data: id, extend
// Optional data: none
handlers._tokens.put = function(data, callback){

    var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id : false,
        extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;

    if(id && extend){

        _data.read("tokens", id, function(err, tokenData){
            if(!err && tokenData){
            
                if(tokenData.expires > Date.now()){

                    tokenData.expires = Date.now() + (1 * 60 * 60 * 1000);

                    _data.update("tokens", id, tokenData, function(err){
                        if(!err){
                            callback(200, tokenData);
                        }
                        else{
                            callback(500, {"Error": "Could not update token"});
                        }
                    });
                }
                else{
                    callback(400, {"Error": "Token expires"});
                }                
            }
            else{
                callback(404);
            }
        });

    }
    else{
        callback(400, {"Error": "Missing required fields"});
    }

}

// Tokens - delete
// Required data: id
// Optional data: none
handlers._tokens.delete = function(data, callback){
    
    var id = typeof(data.queryString.id) == 'string' && data.queryString.id.trim().length == 20 ? data.queryString.id.trim() : false;

    if(id){
        _data.read('tokens', id, function(err, tokenData){
            if(!err && tokenData){
                
                _data.delete("tokens", id, function(err){
                    if(! err){
                        callback(200);
                    }
                    else{
                        callback(500, {"Error": "Could not delete specified token"});
                    }
                });
            }
            else{
                callback(404, {"Error": "Could not find specified token"});
            }
        });
    }
    else{
        callback(400, {'Error': 'Missing required field'});
    }

}

// Verify token
handlers._tokens.verifyToken = function(token, phone, callback){

    _data.read("tokens", token, function(err, tokenData){
        if(!err && tokenData){
            if(phone == tokenData.user && tokenData.expires > Date.now()){
                callback(true);
            }
            else{
                // Delete token file if expired
                // _data.delete("tokens", token, function(err){
                //     callback(false);
                // });

            }
        }
        else{
            callback(false);
        }
    });
}

// Users handler
handlers.checks = function(data, callback){

    var allowed_methods = ['get', 'post', 'put', 'delete'];

    if(allowed_methods.indexOf(data.method) > -1){
        handlers._checks[data.method](data, callback);
    }
    else{
        callback(405);
    }
}

// Container for checks submethods
handlers._checks = {};

// Checks - post
// Required data: protocol, url, method, successCodes, timeOutSeconds
// Optional data: none
handlers._checks.post = function(data, callback){

    var protocol = typeof(data.payload.protocol) == "string" && ["http", "https"].indexOf(data.payload.protocol.trim()) > -1 ? data.payload.protocol.trim() : false,
        url = typeof(data.payload.url) == "string" && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false,
        method = typeof(data.payload.method) == "string" && ["post", "get", "put", "delete"].indexOf(data.payload.method.trim()) > -1 ? data.payload.method.trim() : false,
        successCodes = typeof(data.payload.successCodes) == "object" && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false,
        timeOutSeconds = typeof(data.payload.timeOutSeconds) == "number" && data.payload.timeOutSeconds >= 1 && data.payload.timeOutSeconds <= 5 ? data.payload.timeOutSeconds : false;

    if(protocol && url && method && successCodes && timeOutSeconds){

        // get token from headers
        var token = data.headers.token;

        _data.read("tokens", token, function(err, tokenData){
            if(!err && tokenData){

                var userPhone = tokenData.user;

                handlers._tokens.verifyToken(token, userPhone, function(isValidToken){
                    if(isValidToken){

                        _data.read("users", userPhone, function(err, userData){
                            if(!err && userData){
    
                                var userChecks = typeof(userData.checks) == "object" && userData.checks instanceof Array ? userData.checks : [];
    
                                if(userChecks.length < config.maxChecks){
                                    
                                    // Verify that the URL given has DNS entries (and therefore can be resolve)
                                    var parsedUrl = _url.parse(protocol+'://'+url, true),
                                        hostName = typeof(parsedUrl.hostname) == 'string' && parsedUrl.hostname.length > 0 ? parsedUrl.hostname : false;

                                    dns.resolve(hostName, function(err, records){
                                        if(!err && records){
                                            var checkId = helpers.createRandomString(20),
                                            checkObject = {
                                                "checkId": checkId,
                                                "userPhone": userPhone,
                                                "protocol": protocol,
                                                "url": url,
                                                "method": method,
                                                "successCodes": successCodes,
                                                "timeOutSeconds": timeOutSeconds
                                            };
        
                                        // create specified check
                                        _data.create("checks", checkId, checkObject, function(err){
                                            if(!err){
        
                                                userChecks.push(checkId);
                                                userData.checks = userChecks;                                        
        
                                                // update user object
                                                _data.update("users", userPhone, userData, function(err){
                                                    if(!err){
                                                        callback(200, checkObject);
                                                    }
                                                    else{
                                                        callback(500, {"Error": "Could not update user's check"});
                                                    }
                                                });
                                            }
                                            else{
                                                callback(500, {"Error": "Could not create specified check"});
                                            }
                                        });
                                        }
                                        else{
                                            callback(400, {'Error': 'The hostname of the url entered did not resolve to any DNS entries'});
                                        }
                                    });  
                                }
                                else{
                                    callback(400, {"Error": "Maximum number of "+ config.maxChecks +" checks exceeds"});
                                }
                            }
                            else{
                                callback(403);
                            }
                        });
                    }
                    else{
                        callback(400, {"Error": "Missing token in headers or token is invalid"});
                    }
                });

            }
            else{
                callback(403, {"Error": "Invalid user token"});
            }
        });

    }
    else{
        callback(400, {"Error": "Missing required fields"});
    }
}

// checks - get
// Required data: id
// Optional data: none
handlers._checks.get = function(data, callback){
    var id = typeof(data.queryString.id) == 'string' && data.queryString.id.trim().length == 20 ? data.queryString.id.trim() : false;

    if(id){

        _data.read("checks", id, function(err, checkData){
            if(!err){
                var token = typeof(data.headers.token) == "string" ? data.headers.token : false;

                handlers._tokens.verifyToken(token, checkData.userPhone, function(isValidToken){
                    
                    if(isValidToken){
                        callback(200, checkData);
                    }
                    else{
                        callback(400, {"Error": "Missing token in headers or token is invalid"});
                    }
                });
            }
            else{
                callback(404);
            }
        });
    }
    else{
        callback(400, {'Error': 'Missing required fields'});
    }
}

// checks - put
// Required data: id
// Optional data: protocol, url, method, successCodes, timeOutSeconds
handlers._checks.put = function(data, callback){

    var id = typeof(data.payload.id) == "string" && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;

    if(id){
        var protocol = typeof(data.payload.protocol) == "string" && ["http", "https"].indexOf(data.payload.protocol.trim()) > -1 ? data.payload.protocol.trim() : false,
            url = typeof(data.payload.url) == "string" && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false,
            method = typeof(data.payload.method) == "string" && ["post", "get", "put", "delete"].indexOf(data.payload.method.trim()) > -1 ? data.payload.method.trim() : false,
            successCodes = typeof(data.payload.successCodes) == "object" && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false,
            timeOutSeconds = typeof(data.payload.timeOutSeconds) == "number" && data.payload.timeOutSeconds >= 1 && data.payload.timeOutSeconds <= 5 ? data.payload.timeOutSeconds : false;

        if(protocol || url || method || successCodes || timeOutSeconds){

            // get token from headers
            var token = data.headers.token;

            _data.read("tokens", token, function(err, tokenData){
                if(!err && tokenData){

                    var userPhone = tokenData.user;

                    handlers._tokens.verifyToken(token, userPhone, function(isValidToken){
                        if(isValidToken){
                            
                            _data.read("checks", id, function(err, checkData){
                                if(!err && checkData){
                                    
                                    if(protocol){
                                        checkData.protocol = protocol;
                                    }

                                    if(url){
                                        checkData.url = url;
                                    }

                                    if(method){
                                        checkData.method = method;
                                    }

                                    if(successCodes){
                                        checkData.successCodes = successCodes;
                                    }

                                    if(timeOutSeconds){
                                        checkData.timeOutSeconds = timeOutSeconds;
                                    }

                                    _data.update("checks", id, checkData, function(err){
                                        if(!err){
                                            callback(200, checkData);
                                        }   
                                        else{
                                            callback(500, {"Error": "Could not update check"});
                                        }
                                    });
                                }
                                else{
                                    callback(404, {"Error": "Could not find specified check"});
                                }
                            });
                        }
                        else{
                            callback(400, {"Error": "Missing token in headers or token is invalid"});
                        }
                    });

                }
                else{
                    callback(403, {"Error": "Invalid user token"});
                }
            });

        }
        else{
            callback(400, {"Error": "Missing required fields"});
        }
    }
    else{
        callback(400, {"Error": "Missing required fields"});
    }
}

// checks - delete
// Required data: id
// Optional data: none
handlers._checks.delete = function(data, callback){

    var id = typeof(data.queryString.id) == 'string' && data.queryString.id.trim().length == 20 ? data.queryString.id.trim() : false;

    if(id){
        _data.read('checks', id, function(err, checkData){
            if(!err && checkData){
            
                var token = typeof(data.headers.token) == "string" ? data.headers.token : false;

                handlers._tokens.verifyToken(token, checkData.userPhone, function(isValidToken){
                    if(isValidToken){
                        
                        // Update user object
                        _data.read("users", checkData.userPhone, function(err, userData){
                            if(!err && userData){
                                var indexOfCheckToRemove = userData.checks.indexOf(id);
                                userData.checks.splice(indexOfCheckToRemove, 1);

                                _data.update("users", userData.phone, userData, function(err){
                                    if(!err){
                                        // Delete check
                                        _data.delete("checks", id, function(err){
                                            if(! err){
                                                // delete check from user object
                                                callback(200)
                                            }
                                            else{
                                                callback(500, {"Error": "Could not delete specified check"});
                                            }
                                        });
                                    }
                                    else{
                                        callback(500, {"Error": "Could not delete user check"});
                                    }
                                });
                            }
                            else{
                                callback(400, {"Error": "Could not find user of specified check"});
                            }
                        });
                        
                    }
                    else{
                        callback(403, {"Error": "Missing or invalid user token"});
                    }
                });

            }
            else{
                callback(404, {"Error": "Could not find specified check"});
            }
        });
    }
    else{
        callback(400, {'Error': 'Missing required field'});
    }    
}

// handlers to export
module.exports = handlers;