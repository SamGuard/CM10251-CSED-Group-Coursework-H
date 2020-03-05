const express = require("express");
let router = express.Router();

router.post("/", function(req, res, next){
    let username = req.body.username;
    let password = req.body.password;
    res.send(usename+" "+password);
});

module.exports = router;