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
console.log("Go to https://localhost:3000 make sure you include the https otherwise it won't work");
console.log("Your browser will probably warn you that the certificate is invalid or self signed, just click continue (trust me its safe)");