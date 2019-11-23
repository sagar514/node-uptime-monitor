/*
 * Primary file for API
 *
 */ 

// Dependencies
var server = require('./lib/server'),
    workers = require('./lib/workers'),
    cli = require('./lib/cli'),
    exampleDebuggingProblem = require('./lib/exampleDebuggingProblem');

// Declare the app
var app = {};

// Init function
app.init = function(){
    // Start the server
    debugger;
    server.init();
    debugger;

    // Start the workers
    debugger;
    // workers.init();
    debugger;

    // Start the CLI, but make sure it starts last
    debugger;
    setTimeout(function(){
        cli.init();
    }, 50);
    debugger;

    // Call the init script that will throw error
    exampleDebuggingProblem.init();
    debugger;
}

// Execute
app.init();

// Export the app
module.exports = app;