//This is the file that is run first when the program starts
const http = require('http');
const app = require('./app.js');//The file that contains the routing for the server
const port = process.env.PORT || 3000;//The port to run on, process.env.PORT is the port given by Heroku, if it doesnt exist it uses 3000 instead

var server = http.createServer(app);//Creates the server

server.listen(port);//Listens for incoming connections

console.log("server opened on port 3000");
console.log("Go to localhost:3000");