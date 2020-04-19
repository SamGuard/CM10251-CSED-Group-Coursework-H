//Checks the users username and password against the database to see if they are a valid user
const express = require("express");
let router = express.Router();
const {User} = require("./back/models/User");
const db = require("./back/database/Database").Database;
const {Authenticate} = require("./back/Authenticate");

//List of accepted characters the user can use
let acceptedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%&'*+-=?^_`{|}~@.[]0123456789 "
//Checks if the string entered valid
function charCheck(string){
    let c;
    if(!string){
        return false;
    }
    for(let i = 0; i < string.length; i++){
        if(acceptedChars.includes(string.charAt(i)) === false){
            return false;
        }
    }
    return true;
}

//Checks the username and password
function checkUser(username, password){
    if(charCheck(username) === false || charCheck(password) === false){
        return '{"loggedIn": 0, "reason": "Invalid characters in fields, please use only: A-z, 1-9 or *+-=?^_`{|}~@.[]0123456789"  }';
    }

    if(Authenticate.userLoginDetails(username, password)) {
        console.log("Verified");
        return '{"loggedIn": 1}';
    }

    return '{"loggedIn": 0}';
}


router.post("/", function(req, res, next){
    let username = req.body.username;
    let password = req.body.password;

    res.send(checkUser(username, password));
});



module.exports = router;
module.exports.charCheck = charCheck;
module.exports.checkUser = checkUser;
