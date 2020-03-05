const express = require("express");
fs = require("fs");

let router = express.Router();

let homePage;


fs.readFile(process.cwd() + "/routes/index.html", "utf8", function(err, data){
    homePage = data;
});

router.get("/", function (req, res, next){//When a get request is made on this directory on this server this function is called

    console.log("connection of index-home");

    res.send(homePage);

});



/*
These are just for testing ignore below this.
*/
router.get("/data", function (req,res){
   res.send(`{
        "user": "${req.query.user}",
        "id": ${req.query.id}       
   }`);
});

router.get("/JQueryExample.js", function(req, res, next){
    fs.readFile(process.cwd() + "/JQueryExample.js", "utf8", function(err, data){
        res.send(data);//Send data back to user
    });
});

module.exports = router;