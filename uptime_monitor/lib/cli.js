/*
 * CLI related tasks
 *
 */ 

// Dependencies
var readLine = require('readline'),
    util = require('util'),
    debug = util.debuglog('cli'),
    events = require('events'),
    os = require('os'),
    v8 = require('v8'),
    _data = require('./data-db'),
    _log = require('./logs'),
    helper = require('./helpers');

class _events extends events{};
var e = new _events();

// Instantiate CLI module object
var cli = {};

// Create vertical space
cli.verticalSpace = function(lines){
    lines = typeof(lines) == 'number' && lines > 0 ? lines : 1;
    for(var i = 0; i < lines; i++){
        console.log();
    }
};

// Create hortizontal line across ṭhe screen
cli.horizontalLine = function(){
    // Get available screen width
    var width = process.stdout.columns,
        line = '';
    for(var i = 0; i < width; i++){
        line += '-';
    }
    console.log(line);
};

// Create centered text on the screen
cli.centered = function(str){
    // Get available screen width
    var width = process.stdout.columns,
        padding = width - str.length,
        leftPadding = Math.floor(padding / 2),
        line = '';

    for(var i = 0; i < leftPadding; i++){
        line += ' ';
    }

    line += str;
    console.log(line);
};

// Input handlers
e.on('man', function(str){
    cli.responders.help();
});

e.on('help', function(str){
    cli.responders.help();
});

e.on('stats', function(str){
    cli.responders.stats();
});

e.on('exit', function(str){
    cli.responders.exit();
});

e.on('list users', function(str){
    cli.responders.listUsers();
});

e.on('user info', function(str){
    cli.responders.userInfo(str);
});

e.on('list checks', function(str){
    cli.responders.listChecks(str);
});

e.on('check info', function(str){
    cli.responders.checkInfo(str);
});

e.on('list logs', function(str){
    cli.responders.listLogs();
});

e.on('log info', function(str){
    cli.responders.LogInfo(str);
});

// Responders object
cli.responders = {};

// help/ man responder
cli.responders.help = function(){

    var commands = {
        'exit': 'Kill the CLI (and the rest of the application)',
        'help': 'Show ṭhis help page',
        'man': 'Alais of "help" command',
        'stats': 'Get statistics on the underlying operating system and resource utilization',
        'list users': 'Show the list of all the registered (undeleted) users in the system',
        'user info --{userId}': 'Show details of a specified user',
        'list checks --up --down': 'Show a list of all active checks in the system, including their state. The "--up" and the "--down" flags are both optional',
        'check info --{checkID}': 'Show details of a specified check',
        'list logs': 'Show a list of all the log files (compressed only) to be read',
        'log info --{fileName}': 'Show details of a specified log file'
    };

    cli.horizontalLine();
    cli.centered('CLI Manual');
    cli.horizontalLine();
    cli.verticalSpace(2);

    for(var key in commands){
        if(commands.hasOwnProperty(key)){
            var value = commands[key],
                line = '\x1b[33m' + key + '\x1b[0m',
                padding = 60 - line.length;

            for(var i = 0; i < padding; i++){
                line += ' ';
            }
            line += value;
            console.log(line);
            cli.verticalSpace();
        }
    }

    cli.verticalSpace(1);
    cli.horizontalLine();

};

// exit responder
cli.responders.exit = function(){
    process.exit(0);
};

// stats responder
cli.responders.stats = function(){
    // Compile stats object
    var stats = {
        'Load Average': os.loadavg().join(' '),
        'CPU Count': os.cpus().length,
        'Fre Memory': os.freemem(),
        'Current Malloced Memory': v8.getHeapStatistics().malloced_memory,
        'Peak Malloced Memory': v8.getHeapStatistics().peak_malloced_memory,
        'Allocated Heap Used (%)': Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
        'Available Heap Allocated (%)': Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100),
        'Uptime': os.uptime() + ' seconds'
    };

    // Create Header
    cli.horizontalLine();
    cli.centered('SYSTEM STATISTICS');
    cli.horizontalLine();
    cli.verticalSpace(2);

    // Log out each stat
    for(var key in stats){
        if(stats.hasOwnProperty(key)){
            var value = stats[key],
                line = '\x1b[33m' + key + '\x1b[0m',
                padding = 60 - line.length;

            for(var i = 0; i < padding; i++){
                line += ' ';
            }
            line += value;
            console.log(line);
            cli.verticalSpace();
        }
    }

    // Footer
    cli.verticalSpace(1);
    cli.horizontalLine();

};

// users responder
cli.responders.listUsers = function(){
    
    _data.list('users', function(err, userIds){
        if(!err && userIds && userIds.length > 0){
            userIds.forEach(function(userId){
                _data.read('users', userId, function(err, userData){
                    if(!err && userData){
                        var line = 'Name: '+userData.firstName+' '+userData.lastName+' Phone: '+userData.phone+' Checks: ';
                        var numberOfChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array && userData.checks.length > 0 ? userData.checks.length : 0;

                        line += numberOfChecks;

                        console.log(line);
                        cli.verticalSpace();
                    }
                });
            });
        }
    })
};

// user-info responder
cli.responders.userInfo = function(str){
    // Get user-id from str
    var arr = str.split('--');
    var userId = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;

    if(userId){
        // Lookup for user
        _data.read('users', userId, function(err, userData){
            if(!err && userData){
                // Remove hashed password
                delete userData.hashedPassword;

                // Print JSON with highlighting text
                cli.verticalSpace();
                console.dir(userData, {'colors': true});
                cli.verticalSpace();
            }
        });
    }
};

// checks responder
cli.responders.listChecks = function(str){

    _data.list('checks', function(err, checkIds){
        if(!err && checkIds && checkIds.length > 0){

            // cli.verticalSpace();
            str = str.toLowerCase();

            checkIds.forEach(function(checkId){
                _data.read('checks', checkId, function(err, checkData){
                    // Get state, default to down
                    var state = typeof(checkData.state) == 'string' ? checkData.state : 'down';

                    // Get the state, default to unknown (Display purpose)
                    var stateOrUnknown = typeof(checkData.state) == 'string' ? checkData.state : 'unknown';

                    // If user has specified the state or hasn't specified any state, incude the check
                    if(str.indexOf('--'+state) > -1 || (str.indexOf('--up') == -1 && str.indexOf('--down') == -1)){
                        var line = 'Id: '+checkData.checkId+' '+checkData.method.toUpperCase()+' '+checkData.protocol+'://'+checkData.url+' State: '+stateOrUnknown;

                        console.log(line);
                        cli.verticalSpace();
                    } 
                });
            });
        }
    });
};

// check-info responder
cli.responders.checkInfo = function(str){
    // Get check-id from str
    var arr = str.split('--');
    var checkId = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;

    if(checkId){
        // Lookup for check
        _data.read('checks', checkId, function(err, checkData){
            if(!err && checkData){
                // Print JSON with highlighting text
                cli.verticalSpace();
                console.dir(checkData, {'colors': true});
                cli.verticalSpace();
            }
        });
    }
};

// logs responder
cli.responders.listLogs = function(){
    _log.list(true, function(err, logFileNames){
        if(!err && logFileNames && logFileNames.length > 0){
            logFileNames.forEach(function(logFileName){
                if(logFileName.indexOf('-') > -1){
                    console.log(logFileName);
                    cli.verticalSpace();
                }
            });
        }
    });
};

// log-info responder
cli.responders.LogInfo = function(str){
    // Get log file name from str
    var arr = str.split('--');
    var logFileName = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;

    if(logFileName){
        // Lookup for log file
        _log.decompress(logFileName, function(err, strData){
            if(!err && strData){
                // Split data into lines
                var arr = strData.split('\n');
                arr.forEach(function(jsonString){
                    var logObject = helper.parseJsonToObject(jsonString);
                    if(logObject && JSON.stringify(jsonString) != '{}'){
                        console.dir(logObject, {'colors': true});
                        cli.verticalSpace();
                    }
                });
            }
        });
    }
};

// Input processor
cli.processInput = function(str){
    str = typeof(str) == "string" && str.trim().length > 0 ? str : false;

    // Only process if user has wrote something
    if(str){
        // Identify if input is among the valid commands
        var validCommands = [
            'man',
            'help',
            'stats',
            'exit',
            'list users',
            'user info',
            'list checks',
            'check info',
            'list logs',
            'log info'
        ];

        var matchFound = false,
            counter = 0;

        validCommands.some(function(command){
            if(str.toLowerCase().indexOf(command) > -1){
                matchFound = true;

                // Emit event
                e.emit(command, str);
                return true;
            }
        });

        // If no match is found, tell user to try again
        if(!matchFound){
            console.log("Sorry, try again");
        }
    }

}

// Init script
cli.init = function(){
    // Send the start message to the console
    console.log('\x1b[34m%s\x1b[0m', "The CLI is running");

    // Start the interface
    var _interface = readLine.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '>'
    });

    // Create the prompt
    _interface.prompt();

    // Handle each line of input seperately
    _interface.on('line', function(str){
        // Send to the input processor
        cli.processInput(str);

        // Re-initialise interface prompt
        _interface.prompt();
    });

    // If user stope CLI, kill the process
    _interface.on('close', function(){
        process.exit(0);
    });

}

// Export module
module.exports = cli;