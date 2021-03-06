/*
 * Create and export configuration variables
 *
 */ 

// Environment container
var environments = {};

environments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'hashingSecret': 'ThisIsASecret',
    'envName': 'staging',
    'maxChecks': 5,
    'twilio': {
        'accoundSid': 'ACb32d411ad7fe886aac54c665d25e5c5d',
        'authToken': '9455e3eb3109edc12e3d8c92768f7a67',
        'fromPhone': '+15005550006'
    },
    'templateGlobals': {
        'appName': 'Uptime Monitor',
        'companyName': 'X99, Inc',
        'yearCreated': '2019',
        'baseUrl': 'http:localhost:3000'
    }
};

environments.testing = {
    'httpPort': 4000,
    'httpsPort': 4001,
    'hashingSecret': 'ThisIsASecret',
    'envName': 'testing',
    'maxChecks': 5,
    'twilio': {
        'accoundSid': 'ACb32d411ad7fe886aac54c665d25e5c5d',
        'authToken': '9455e3eb3109edc12e3d8c92768f7a67',
        'fromPhone': '+15005550006'
    },
    'templateGlobals': {
        'appName': 'Uptime Monitor',
        'companyName': 'X99, Inc',
        'yearCreated': '2019',
        'baseUrl': 'http:localhost:3000'
    }
};

environments.production = {
    'httpPort': 5000,
    'httpPort': 5001,
    'hashingSecret': 'ThisIsAlsoASecret',
    'envName': 'production',
    'maxChecks': 5,
    'twilio': {
        'accoundSid': 'ACb32d411ad7fe886aac54c665d25e5c5d',
        'authToken': '9455e3eb3109edc12e3d8c92768f7a67',
        'fromPhone': '+15005550006'
    },
    'templateGlobals': {
        'appName': 'Uptime Monitor',
        'companyName': 'X99, Inc',
        'yearCreated': '2019',
        'baseUrl': 'http:localhost:5000'
    }
};

// Determine whch environment to export
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// module.exports = (typeof(environments[currentEnvironment]) == 'object') ? environments[currentEnvironment] : environments.staging;

module.exports = (currentEnvironment == 'production') ? environments[currentEnvironment] : environments.staging;