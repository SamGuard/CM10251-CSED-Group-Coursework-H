const express = require('express');//Used for incoming http requests
const app = express();
const bodyparse = require("body-parser");




//Defining the local directory of the routes
const index = require('./index');


app.use(bodyparse());
app.use(express.static("public"));

//Assigning directories to redirect the incoming request to
app.use("/",index);
app.use("/time" ,function(req, res, next){
    res.send(`{"date": ${Date.now().toString()}}`);
});
app.use("/data" , index);


//This deals with when a directory has not been found
app.use(function(req, res, next){
    res.send("<!DOCTYPE html><html>Directory not found!</html>");
});


module.exports = app;