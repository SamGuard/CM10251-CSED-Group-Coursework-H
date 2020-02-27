express = require("express");
fs = require("fs");

router = express.Router();



router.get("/", function (req, res, next){//When a get request is made on this directory on this server this function is called

    console.log("connection of index-home");


    fs.readFile(process.cwd() + "/routes/index.html", "utf8", function(err, data){
        res.send(data);//Send data back to user
    });
});

module.exports = router;