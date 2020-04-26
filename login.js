//Checks the users username and password against the database to see if they are a valid user
const express = require("express");
let router = express.Router();
const {User} = require("./back/models/User");
const db = require("./back/database/Database").Database;
const Auth = require("./back/Authenticate");



router.post("/", function(req, res, next){
    let username = req.body.username;
    let password = req.body.password;


    let result = Auth.checkUser(username,password);



    if(result == 1){
        let token = Auth.getToken(username);
        res.send(`{"loggedIn": 1, "reason": "", "token": "${token}"}`);
    }else if(result == 0){
        res.send('{"loggedIn": 0, "reason": "Invalid characters in fields, please use only: A-z, 1-9 or *+-=?^_`{|}~@.[]0123456789"  }')
    }else{
        res.send( '{"loggedIn": 0, "reason": "Invalid login details"}');
    }

});


module.exports = router;
