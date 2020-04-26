//Index deals with sending back the correct page when requested
const express = require("express");
const fs = require("fs");

let router = express.Router();

let loginPage;
let homePage;


fs.readFile(process.cwd() + "/routes/index.html", "utf8", function(err, data){
    loginPage = data;
});


fs.readFile(process.cwd() + "/routes/home.html", "utf8", function(err, data){
    homePage = data;
});

router.get("/", function (req, res, next){//When a get request is made on this directory on this server this function is called
    res.send(loginPage);

});

router.get("/home", function (req, res, next){//When a get request is made on this directory on this server this function is called

    res.send(homePage);

});

module.exports = router;
