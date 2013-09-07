var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var broadcast = io.sockets;

var sensors = require('./sensors');

app.use(express.static(__dirname + '/../public'));

sensors(function(error, phidgets) {
  if(error) {
    return;
  }

  phidgets.on('data', broadcast.emit.bind(broadcast, 'phidget'));
});

server.listen(8888);
