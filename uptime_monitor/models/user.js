var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// Create a user-schema
var userSchema = new Schema({
    "firstName": String,
    "lastName": String,
    "phone": String,
    "hashedPassword": String,
    "tosAgreement": Boolean,
    "createdAt": Date,
    "updatedAt": Date
});

// on every save, add the date
userSchema.pre('save', function(next) {
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
var user = mongoose.model('User', userSchema);

// Export model
module.exports = user;
