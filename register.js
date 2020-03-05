const express = require("express");
let router = express.Router();

router.post("/", function(req, res, next){
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    res.send(username+" "+password+" "+email);
});

module.exports = router;