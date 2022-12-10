//REFERENCE TO WEEK 12 NOTES AND WEEK 8

var mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;
let User; // to be defined on new connection

//define "userSchema" 
var userSchema = new Schema({
    "userName":{"type": String, "unique": true},
    "password": String,
    "email": String,        
    "loginHistory":  [{"dateTime":Date, "userAgent":String}]
});


//SETTING UP THE DB AND THE CONNECTION 
exports.initialize = function() {
    return new Promise((resolve,reject) => {
        let db = mongoose.createConnection("mongodb+srv://Broin_atlas:jef1mPnX4dNYxhz1@senecaweb.za3htxw.mongodb.net/?retryWrites=true&w=majority",
         { useNewUrlParser: true });
        db.on('error', (err) => {
            reject(err);
        })
        db.once('open', () => {
            User = db.model("Users", userSchema);
            resolve("Succesfully connected to the database!");
        })
    })
};

//REGISTER THE USER 
exports.registerUser = function(userData) {
    return new Promise(function (resolve, reject) {
         //if both passswords are the same 
        if (userData.password == userData.password2) {
        //    if (userData.password != userData.password2) {
            bcrypt.hash(userData.password, 10, function(err, hash) {
                //if an error was caught
                if (err) {
                    reject("There was an error encrypting the password");
                }
                // else if(userData.password == null || userData.password2 == null)
                // {
                //     reject("user name cannot be empty or only white spaces");
                // }
            
               ///CREATE A NEW USER INSTANCE
                userData.password = hash;
                let newUser = new User(userData);
                newUser.save(function(err) {
                    if (err) {
                        if (err.code == 11000) {
                            reject("User Name already taken");
                        } else {
                            reject("There was an error creating the user: " + err);
                        }
                    } else {
                        resolve();
                    }
                });
            })
        } else {
            reject("Passwords do not match");
        }
    });
}

//CHECK THE USER 
exports.checkUser = function(userData) {
    return new Promise(function (resolve, reject) {
        
        User.find({ userName: userData.userName }).exec().then((foundUser) => {
            if (foundUser.length == 0) {
                reject("Unable to find username: " + userData.userName);
                

            } else {  
                bcrypt.compare(userData.password, foundUser.password, function (err, res) {
                    if (res === true) { //record "loginHistory" array
                        if (foundUser.loginHistory == null) {
                        foundUser.loginHistory = []; //empty array 
                        }
                        //Using the returned user object, push the following object onto its "loginHistory" array:
                        foundUser.loginHistory.push({ 
                            dateTime: (new Date()).toString(),
                            userAgent: userData.userAgent
                        });
                        //Update method 
                        User.updateOne({ userName: foundUser.userName },
                            { $set: { loginHistory: foundUser.loginHistory } }
                        ).exec()
                        .then(function() {  //if update was succesful
                            resolve(foundUser);
                        })
                        .catch(function(err) { 
                            reject("There was an error verifying the username: " + err);
                        });
                    } else if (res === false) {
                        reject("Unable to find username: " + userData.userName);
                    }
                    else {//if password doesn’t match user’s input
                        reject("Incorrect Password for user: " + userData.userName); 
                    }
                });
                
            }
        })
        .catch(function() {
            reject("Unable to find user: " + userData.userName);
        }); 
    })
} 

