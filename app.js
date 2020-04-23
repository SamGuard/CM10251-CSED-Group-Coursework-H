//This is where the routing for incoming connections are defined

express = require('express');//Used for dealing with incoming http requests
const app = express();
const bodyparse = require("body-parser");//Middleware function used to parse the incoming connection




//Defining the local directory of the routes
const index = require('./index');
const login = require("./login");
const register = require("./register");
const data = require("./data");

app.use(bodyparse());
app.use(express.static("public"));

//Assigning directories to redirect the incoming request to
app.use("/",index);
app.use("/login", login);
app.use("/register", register);
app.use("/data", data);


//This deals with when a directory has not been found
app.use(function(req, res, next){
    res.send("<!DOCTYPE html><html>Directory not found!</html>");
});


module.exports = app;
