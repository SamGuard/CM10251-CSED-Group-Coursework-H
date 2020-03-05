const express = require("express");
let router = express.Router();

router.post("/", function(req, res, next){
    let username = req.body.username;
    let password = req.body.password;
    res.send(username+" "+password);
});

module.exports = router;
