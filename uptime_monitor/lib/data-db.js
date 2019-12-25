/*
 * To perform file operations
 *
 */ 

//  Dependencies
var mongoose = require('mongoose'),
    path = require('path'),
    helpers = require('./helpers'),
    users = require('../models/user'),
    tokens = require('../models/token'),
    checks = require('../models/check');

// Container
var lib = {};

// Base directory of data folder
lib.baseDir = path.join(__dirname + '/../.data/');

// Connect to DB
mongoose.connect('mongodb://localhost/uptime_monitor', {useUnifiedTopology: true, useNewUrlParser: true});
mongoose.connection
    .once('open', function(){
        console.log('Connected');
        // done();
    })
    .on('error', function(error){
        console.log(error);
    });

/*
 * Function to create document
 * Parameters description: 
 * dir is model name
 * file is unique property of document
 * data is document data
 */ 
lib.create = function(dir, file, data, callback){
    
    // create a new document
    if(dir == 'users'){
        var newRecord = users(data);
    }
    else if(dir == 'checks'){
        var newRecord = checks(data);
    }
    else if(dir == 'tokens'){
        var newRecord = tokens(data);
    }

    // save the document
    newRecord.save(function(err) {
        if(err){
            callback('Oops, error occurred');
        }
        else{
            callback(false);
        }
    });

};

// Function to read document
lib.read = function(dir, file, callback){

    if(dir == 'users'){
        users.findOne({phone: file}, function(err, userData){
            
            if(! userData){                
                callback(true);
            }
            else{
                callback(false, userData);
            }
        });
    }
    else if(dir == 'checks'){
        checks.findOne({checkId: file}, function(err, checkData){
            if(! checkData){
                callback(true);
            }
            else{
                callback(false, checkData);
            }
        });
    }
    else if(dir == 'tokens'){
        tokens.findOne({token: file}, function(err, tokenData){
            if(! tokenData){
                callback(true);
            }
            else{
                callback(false, tokenData);
            }
        });
    }
};

// Function to update document
lib.update = function(dir, file, data, callback){

    if(dir == 'users'){
        users.updateOne({phone: file}, {$set: data}, function(err, res){
            if(! err){
                callback(false);
            }
            else{
                callback(err, res);
            }
        });
    }
    else if(dir == 'checks'){
        checks.updateOne({checkId: file}, {$set: data}, function(err, res){
            if(! err){
                callback(false);
            }
            else{
                callback(err, res);
            }
        });
    }
    else if(dir == 'tokens'){
        tokens.updateOne({token: file}, {$set: data}, function(err, res){
            if(! err){
                callback(false);
            }
            else{
                callback(err, res);
            }
        });
    }

};

// Function to delete document
lib.delete = function(dir, file, callback){
    
    if(dir == 'users'){
        users.deleteOne({phone: file}, function(err, res){
            if(! err){
                callback(false);
            }
            else{
                callback(err, res);
            }
        });
    }
    else if(dir == 'checks'){
        checks.deleteOne({checkId: file}, function(err, res){
            if(! err){
                callback(false);
            }
            else{
                callback(err, res);
            }
        });
    }
    else if(dir == 'tokens'){
        tokens.deleteOne({token: file}, function(err, res){
            if(! err){
                callback(false);
            }
            else{
                callback(err, res);
            }
        });
    }
};

// Function to list all documents of specified model
lib.list = function(dir, callback){

    if(dir == 'users'){
        users.find({}, function(err, data){
            if(!err && data && data.length > 0){
                var trimmedFileNames = [];
                data.forEach(function(user){
                    trimmedFileNames.push(user.phone);
                });
                callback(false, trimmedFileNames);
            }
            else{
                callback(err, data);
            }
        });
    }
    else if(dir == 'checks'){
        checks.find({}, function(err, data){
            if(!err && data && data.length > 0){
                var trimmedFileNames = [];
                data.forEach(function(check){
                    trimmedFileNames.push(check.checkId);
                });
                callback(false, trimmedFileNames);
            }
            else{
                callback(err, data);
            }
        });
    }
    else if(dir == 'tokens'){
        tokens.find({}, function(err, data){
            if(!err && data && data.length > 0){
                var trimmedFileNames = [];
                data.forEach(function(token){
                    trimmedFileNames.push(token.token);
                });
                callback(false, trimmedFileNames);
            }
            else{
                callback(err, data);
            }
        });
    }
}

// Module to export
module.exports = lib;