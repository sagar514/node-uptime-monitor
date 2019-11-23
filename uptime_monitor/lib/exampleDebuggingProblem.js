/*
 * Library to throw error when its init() is called
 *
 */

// Container for the module
var example = {};

example.init = function(){
    // Error created intentionally (bar is not defined)
    var foo = bar;
}

// Export the module
module.exports = example;