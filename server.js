const https = require('http');
const fs = require('fs');
const app = require('./app.js');
const port = process.env.PORT || 3000;

var server = https.createServer(app);

server.listen(port);

console.log("server opened on port 3000");
console.log("Go to localhost:3000");
console.log("Your browser will probably warn you that the certificate is invalid or self signed, just click continue (trust me its safe)");