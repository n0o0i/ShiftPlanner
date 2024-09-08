const express = require('express');
const path = require('path');
const server = express();
const bodyParser = require('body-parser');
const cors = require('cors');

const api = require('./routes/api');
const index = require('./routes/index');

server.use(express.urlencoded({extended: true}));
server.use(express.json());
server.use(cors());
server.use(bodyParser.json());

const port = process.env.PORT || 3000

server.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

server.use('/_api/', api);

server.use(express.static(path.join(__dirname, '../frontend/build')));
// server.use(express.static(path.join(__dirname, '../frontend/src')));
server.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
    // res.sendFile(path.join(__dirname, '../frontend/public', 'index.html'));
});


server.get('*', (req, res) => {
    return handle(req, res);
  })
  
  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
  
  module.exports = server;