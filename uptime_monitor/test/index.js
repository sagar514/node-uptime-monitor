/*
 * Test Runner
 *
 */

// Dependencies

// Override NODE_ENV variable
process.env.NODE_ENV = 'testing';

// Application logic for test runner
var _app = {};

// Container for the tests
_app.tests = {
    'unit': require('./unit'),
    'api': require('./api')
};

// Count all tests
_app.countTests = function(){
    var counter = 0;
    for(var key in _app.tests){
        if(_app.tests.hasOwnProperty(key)){
            var subTests = _app.tests[key];

            for(var testName in subTests){
                if(subTests.hasOwnProperty(testName)){
                    counter++;
                }
            }
        }
    }
    return counter;
};

// Run all tests, collecting errors and successes
_app.runTests = function(){
    
    var errors = [],
        successes = 0,
        limit = _app.countTests(),
        counter = 0;

    for(var key in _app.tests){
        if(_app.tests.hasOwnProperty(key)){
            var subTests = _app.tests[key];

            for(var testName in subTests){
                if(subTests.hasOwnProperty(testName)){
                    
                    (function(){
                        var tmpTestName = testName,
                            testValue = subTests[testName];

                        // Call the test
                        try{
                            testValue(function(){
                                // It it call back without throwing, then it succeded
                                console.log('\x1b[32m%s\x1b[0m', tmpTestName);
                                counter++;
                                successes++;

                                if(counter == limit){
                                    _app.produceTestReport(limit, successes, errors);
                                }
                            });
                        }
                        catch(e){
                            // If it throws then it failed, capture the error and log it
                            errors.push({
                                'name': tmpTestName,
                                'error': e
                            });
                            console.log('\x1b[31m%s\x1b[0m', tmpTestName);
                            counter++;

                            if(counter == limit){
                                _app.produceTestReport(limit, successes, errors);
                            }
                        }
                    })();
                }
            }
        }
    }
    
};

// Produce a test outcome report
_app.produceTestReport = function(limit, successes, errors){
    console.log('');
    console.log('------------- TEST REPORT -------------');
    console.log('');
    console.log('Total Tests: ', limit);
    console.log('Pass: ', successes);
    console.log('Fail: ', errors.length);
    console.log('');

    // If there are errors, print them in detail 
    if(errors.length > 0){
        console.log('------------- ERROR DETAILS -------------');
        console.log('');

        errors.forEach(function(testError){
            console.log('\x1b[31m%s\x1b[0m', testError.name);
            console.log(testError.error);
            console.log('');
        });

        console.log('');    
        console.log('------------- END ERROR DETAILS -------------');
    }
    
    console.log('');
    console.log('------------- END TEST REPORT -------------');
    process.exit(0);
}

// Run the ṭests
_app.runTests();