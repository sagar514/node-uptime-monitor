/*
 * To perform file operations
 *
 */ 

//  Dependencies
var fs = require('fs'),
    path = require('path'),
    helpers = require('./helpers');

// Container
var lib = {};

// Base directory of data folder
lib.baseDir = path.join(__dirname + '/../.data/');

// Function to create file
lib.create = function(dir, file, data, callback){

    fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', function(err, fileDescriptor){
        if(!err && fileDescriptor){

            // Convert data to string to write in file
            var stringData = JSON.stringify(data);

            // Write to file and close the file
            fs.writeFile(fileDescriptor, stringData, function(err){
                if(!err){
                    fs.close(fileDescriptor, function(err){
                        if(!err){
                            callback(false);
                        }
                        else{
                            callback('Error closing file');
                        }
                    })
                }
                else{
                    callback('Error writing data to file');
                }
            });
        }
        else{
            callback('Error creating new file, it may already exist');
        }
    });
};

// Function to read file
lib.read = function(dir, file, callback){

    fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', function(err, data){
        if(! err){
            var parsedData = helpers.parseJsonToObject(data);
            callback(false, parsedData);
        }
        else{
            callback(err, data);
        }
    });
};

// Function to update file
lib.update = function(dir, file, data, callback){

    fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', function(err, fileDescriptor){
        if(!err && fileDescriptor){

            // Convert data to string
            var stringData = JSON.stringify(data);

            // Truncate previous data
            fs.truncate(fileDescriptor, function(err){
                if(!err){

                    fs.writeFile(fileDescriptor, stringData, function(err){
                        if(!err){
                            fs.close(fileDescriptor, function(err){
                                if(!err){
                                    callback(false);
                                }
                                else{
                                    callback('Error closing file');
                                }
                            });
                        }
                        else{
                            callback('Error updating file');
                        }
                    });
                }
                else{
                    callback('Error truncating file');
                }
            });
        }
        else{
            callback('Error opening file, it may not exists');
        }
    });
};

// Function to delete file
lib.delete = function(dir, file, callback){
    fs.unlink(lib.baseDir + dir + '/' + file + '.json', function(err){
        if(! err){
            callback(false);
        }
        else{
            callback('Error deleting file');
        }
    });
};

// Module to export
module.exports = lib;