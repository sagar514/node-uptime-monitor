var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// Create a user-schema
var checkSchema = new Schema({
    "checkId": String,
    "userPhone": String,
    "protocol": String,
    "url": String,
    "method": String,
    "successCodes": Array,
    "timeOutSeconds": Number,
    "state": String,
    "lastChecked": {type: Date, default: Date.now},
    "createdAt": Date,
    "updatedAt": Date
});

// on every save, add the date
checkSchema.pre('save', function(next) {
    // get the current date
    var currentDate = new Date();
  
    // change the updatedAt field to current date
    this.updatedAt = currentDate;
  
    // if createdAt doesn't exist, add to that field
    if(!this.createdAt){
        this.createdAt = currentDate;
    }

    next();
});

// Create model
var check = mongoose.model('Check', checkSchema);

// Export model
module.exports = check;