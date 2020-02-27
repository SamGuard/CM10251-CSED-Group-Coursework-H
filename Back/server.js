const https = require('https');
const fs = require('fs');
const app = require('app.js');

const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

https.createServer(options, app).listen(3000);