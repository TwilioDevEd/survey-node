var app = require('./app');
var config = require('./config');
var http = require('http');

// Create HTTP server and mount Express app
var server = http.createServer(app);
server.listen(config.port, function() {
    console.log('Express server started on *:'+config.port);
});
