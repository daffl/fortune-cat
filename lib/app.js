var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var sensors = require('./sensors');
var fs = require('fs');
var _ = require('underscore');

io.enable('browser client etag');
io.set('log level', 0);

io.set('transports', [
  'xhr-polling', 'websocket', 'flashsocket',
  'htmlfile', 'jsonp-polling'
]);

app.use(express.static(__dirname + '/../public'))
  .get('/fortunes', function(req, res, next) {
    fs.readFile(__dirname + '/../assets/fortunes.txt', function(error, data) {
      if(error) {
        return next(error);
      }

      var fortunes = _.filter(data.toString().split('\n'), function(text) {
        return text.replace(/^\s+|\s+$/g, '') !== '';
      });

      res.json({
        fortunes: fortunes
      });
    });
  });

sensors(io.sockets);

server.listen(8888);
