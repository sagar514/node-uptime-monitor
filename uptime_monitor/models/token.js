var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// Create a user-schema
var tokenSchema = new Schema({
    "user": String,
    "token": String,
    "expires": {type: Date, default: Date.now},
    "createdAt": Date,
    "updatedAt": Date
});

// on every save, add the date
tokenSchema.pre('save', function(next) {
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
var token = mongoose.model('Token', tokenSchema);

// Export model
module.exports = token;