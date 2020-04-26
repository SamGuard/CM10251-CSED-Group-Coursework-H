//Checks to see if the user can register with the given data, then adds it to the database if so
const express = require("express");
const db = require("./back/database/Database").Database;
const userClass = require("./back/models/User");
const sha256 = require("sha256");

let router = express.Router();

//Characters the user can use
let acceptedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%&'*+-=?^_`{|}~@.[]0123456789 "
//Checks to see if a string is a valid string
function charCheck(string){
    let c;
    for(let i = 0; i < string.length; i++){
       if(acceptedChars.includes(string.charAt(i)) === false){
           return false;
       }
    }
    return true;
}


router.post("/", function(req, res, next){
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;

    if(charCheck(username) === false || charCheck(password) === false || charCheck(email) === false){
        res.send('{"userRegistered": 0, "reason": "Invalid characters in fields, please use only: A-z, 1-9 or *+-=?^_`{|}~@.[]0123456789"  }');
        return;
    }
    if(password.length < 8 || password.length > 24){
        res.send('{"userRegistered": 0, "reason": "Password must be between 8 and 24 characters"  }');
        return;
    }

    let salt = sha256(Date.now().toString());
    let user = new userClass.User(username, sha256(password + salt), salt, email, Date.now(),);



    var result = db.createUser(user);

    if(result == 1){
        res.send('{"userRegistered": 1, "reason":""}');
    }else {
        res.send('{"userRegistered": 0, "reason":"User already exists"}');
    }
});

module.exports = router;
