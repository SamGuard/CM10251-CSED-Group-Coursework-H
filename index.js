express = require("express");
fs = require("fs");

router = express.Router();



router.get("/", function (req, res, next){//When a get request is made on this directory on this server this function is called

    console.log("connection of index-home");


    fs.readFile(process.cwd() + "/index.html", "utf8", function(err, data){
        res.send(data);//Send data back to user
    });
});

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