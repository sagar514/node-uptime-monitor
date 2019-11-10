/*
 * CLI related tasks
 *
 */ 

// Dependencies
var readLine = require('readline'),
    util = require('util'),
    debug = util.debuglog('cli'),
    events = require('events');

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
    cli.responders.listChecks();
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
        'list logs': 'Show a list of all the log files (compressed and uncompressed) to be read',
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
    console.log('You asked for stats');
};

// users responder
cli.responders.listUsers = function(){
    console.log('You asked for users');
};

// user-info responder
cli.responders.userInfo = function(str){
    console.log('You asked for user info', str);
};

// checks responder
cli.responders.listChecks = function(){
    console.log('You asked for checks');
};

// check-info responder
cli.responders.checkInfo = function(str){
    console.log('You asked for check info', str);
};

// logs responder
cli.responders.listLogs = function(){
    console.log('You asked for logs');
};

// log-info responder
cli.responders.LogInfo = function(str){
    console.log('You asked for log info', str);
};

// Input processor
cli.processInput = function(str){
    str = typeof(str) == "string" && str.trim().length > 1 ? str : false;

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