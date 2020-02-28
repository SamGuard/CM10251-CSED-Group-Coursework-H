const https = require('https');
const fs = require('fs');
const app = require('./app.js');



const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

var server = https.createServer(options, app);

server.listen(3000);

console.log("server opened on port 3000");