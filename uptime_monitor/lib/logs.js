/*
 * To store and rotate log files
 *
 */ 

//  Dependencies
var fs = require('fs'),
    path = require('path'),
    zlib = require('zlib');

// Container for the module
var lib = {};

// Base directory of log folder
lib.baseDir = path.join(__dirname + '/../.logs/');

// Function to append data to file
lib.append = function(fileName, str, callback){
    // Open file to log data
    fs.open(lib.baseDir + fileName + '.log', 'a', function(err, fileDescriptor){
        if(!err && fileDescriptor){
            // Append data & close it
            fs.appendFile(fileDescriptor, str + "\n", function(err){
                if(!err){
                    fs.close(fileDescriptor, function(err){
                        if(!err){
                            callback(false);
                        }
                        else{
                            callback("Error closing log file");
                        }
                    });
                }
                else{
                    callback("Error appending data to file");
                }
            });
        }
        else{
            callback("Error opening file to append");
        }
    });
}

// Function to list items in logs directory
lib.list = function(includeCompressedFiles, callback){
    fs.readdir(lib.baseDir, function(err, files){
        if(!err && files && files.length > 0){
            var trimmedFileNames = [];
            files.forEach(function(file){
                // Get log files
                if(file.indexOf(".log") > -1){
                    trimmedFileNames.push(file.replace(".log", ""));
                }
                
                // Get compressed files
                if(includeCompressedFiles && file.indexOf(".gz.b64") > -1){
                    trimmedFileNames.push(file.replace(".gz.b64", ""));
                }
            });

            callback(false, trimmedFileNames);
        }
        else{
            callback(err, files);
        }
    });
}

// Function to compress log file
lib.compress = function(fileId, newFileId, callback){
    
    var srcFile = fileId+".log",
        destFile = newFileId+".gz.b64";

    // Read data from source file
    fs.readFile(lib.baseDir+srcFile, "utf8", function(err, dataString){
        if(!err && dataString){
            // Compress data using gzip
            zlib.gzip(dataString, function(err, buffer){
                // Write compressed data to destination file
                fs.open(lib.baseDir+destFile, 'wx', function(err, fileDescriptor){
                    if(!err && fileDescriptor){
                        fs.writeFile(fileDescriptor, buffer.toString("base64"), function(err){
                            if(!err){
                                // Close file
                                fs.close(fileDescriptor, function(err){
                                    if(!err){
                                        callback(false);
                                    }
                                    else{
                                        callback(err);
                                    }
                                });
                            }
                            else{
                                callback(err);
                            }
                        });
                    }
                    else{
                        callback(err);
                    }
                });
            });
        }
        else{
            callback(err);
        }
    });
}

// Function to truncate log file
lib.truncate = function(file, callback){

    fs.truncate(lib.baseDir+file+".log", 0, function(err){
        if(!err){
            callback(false);
        }
        else{
            callback(err);
        }
    });

    /* fs.open(lib.baseDir+"logs/"+file+".log", "r+", function(err, fileDescriptor){
        if(!err && fileDescriptor){
            fs.truncate(fileDescriptor, function(err){
                if(!err){
                    callback(false);
                }
                else{
                    callback(err);
                    // callback("Error truncating file:", file+".log");
                }
            });
        }
        else{
            callback(err);
            // callback("Error opening log file to truncate");
        }
    }); */
}


// Export the module
module.exports = lib;