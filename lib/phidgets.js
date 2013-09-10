// Phidgets for nodeJS
// Evan Tahler
// https://github.com/evantahler/ndoePhidgets
// 2012

////////////////////////////////////////////////////////////////////////////
// SETUP

var net = require('net');
var EventEmitter = require('events').EventEmitter;

var phidgets = new EventEmitter;
phidgets.data = {} // data array of current sensor values
phidgets.data.inputs = {};
phidgets.data.outputs = {};
phidgets.data.sensors = {};
phidgets.ready = false;
phidgets.socketDataString = "";

////////////////////////////////////////////////////////////////////////////
// DEFAULTS
phidgets.defaults = {
  host: "127.0.0.1",
  port: 5001,
  version: "1.0.9",
  password: null,
  rawLog: false
};

////////////////////////////////////////////////////////////////////////////
// EVENTS (to be emitted)
var emit_log = function(msg){
  phidgets.emit('log', msg);
};

var emit_data = function(type, id, value){
  phidgets.emit('data', type, id, value);
};

////////////////////////////////////////////////////////////////////////////
// CONNECTING AND DISCONNECTING
phidgets.connect = function(params, next){
  if(params == null){params = phidgets.defaults};
  if(params.host == null){params.host = phidgets.defaults.host;}
  if(params.port == null){params.port = phidgets.defaults.port;}
  if(params.version == null){params.version = phidgets.defaults.version;}
  if(params.rawLog == null){params.rawLog = phidgets.defaults.rawLog;}
  phidgets.params = params;

  emit_log("Connecting...");
  emit_log("Parms:");
  for (var i in params){
    emit_log("  "+i+": "+params[i]);
  }

  phidgets.client = net.createConnection(params.port, params.host, function(){
    phidgets.client.setEncoding('utf8');
    phidgets.client.setKeepAlive("enable", 10000)
    phidgets.client.on('data', phidgets.handleData);
    phidgets.client.on('end', phidgets.handleConnectionEnd);
    phidgets.client.on('close', phidgets.handleConnectionEnd);
    phidgets.client.on('error', function(e){ throw "Error with connection to Phidget Board"; });

    phidgets.client.write("995 authenticate, version="+params.version+"\r\n");
    phidgets.client.write("report 8 report\r\n");
    phidgets.client.write("set /PCK/Client/0.0.0.0/1/PhidgetInterfaceKit=\"Open\" for session\r\n");
    phidgets.client.write("listen /PSK/PhidgetInterfaceKit lid0\r\n");

    if(typeof next == "function"){
      phidgets.checkReady(function(data) {
        next(null, data);
      });
    }
  });

  phidgets.client.on("error", function(e){
    next(new Error("Cannot connect to phidget board.  Check you params"));
  });
};

phidgets.checkReady = function(next){
  if(phidgets.ready == false){
    emit_log("Not ready yet...");
    setTimeout(phidgets.checkReady, 1000, next);
  }else{
    emit_log("Connected to PhidgetBoard with ID #"+phidgets.data.boardID);
    if(typeof next == "function"){
      next(phidgets.data);
    }
  }
};

phidgets.quit = function(next){
  phidgets.ready = false;
  phidgets.client.write("quit\r\n");
  if(typeof next == "function"){
    phidgets.checkDisconnect(next);
  }
};

phidgets.checkDisconnect = function(next){
  if(objLenght(phidgets.data) > 0){
    setTimeout(phidgets.checkDisconnect, 1000, next);
  }else{
    if(typeof next == "function"){ next(); }
  }
};

////////////////////////////////////////////////////////////////////////////
// EVENTS
phidgets.handleData = function(chunk){
  try{
    var index, line;
    phidgets.socketDataString += chunk.toString('utf8');
    while((index = phidgets.socketDataString.indexOf('\n')) > -1) {
      var line = phidgets.socketDataString.slice(0, index);
      phidgets.socketDataString = phidgets.socketDataString.slice(index + 1);
      line = line.replace(/\u0000/gi, "");
      line = line.replace(/\u0001/gi, "");
      if (phidgets.params.rawLog){ emit_log(line); }
      var words = line.split(" ");
      if(words[0] == "report" && words[3] == "pending,"){
        var keys = words[5].split("/");
        if(keys[5] == "Input"){
          var thisValue = words[8].replace('"',"");
          phidgets.data.inputs[parseInt(keys[6])] = parseInt(thisValue);
          emit_data("Input", parseInt(keys[6]), parseInt(thisValue));
        } else if(keys[5] == "Sensor"){
          var thisValue = words[8].replace('"',"");
          phidgets.data.sensors[parseInt(keys[6])] = parseInt(thisValue);
          emit_data("Sensor", parseInt(keys[6]), parseInt(thisValue));
        } else if(keys[5] == "Output"){
          var thisValue = words[8].replace('"',"");
          phidgets.data.outputs[parseInt(keys[6])] = parseInt(thisValue);
          emit_data("Output", parseInt(keys[6]), parseInt(thisValue));
        }
        if (phidgets.data.boardID == null){
          phidgets.data.boardID = parseInt(keys[4]);
        }
      }
      if(phidgets.ready == false && line == "report 200-that's all for now"){
        phidgets.ready = true;
      }
    }
  }catch(e){
    console.log(e);
  }
};

phidgets.setOutput = function(output, value){
  if(value == true){ value = "1"; }
  if(value == false){ value = "0"; }
  output = parseInt(output);
  value = parseInt(value);
  if(value == "1" || value == "0"){
    if(objLenght(phidgets.data.outputs) >= output){
      var msg = 'set /PCK/PhidgetInterfaceKit/'+phidgets.data.boardID+'/Output/'+output+'="'+value+'"\r\n';
      phidgets.client.write(msg);
      return true;
    }else{
      return false;
    }
  }else{
    return false
  }
};

phidgets.handleConnectionEnd = function(){
  if(objLenght(phidgets.data) > 0){
    phidgets.data = {};
    if(phidgets.ready == false){
      emit_log("Connection to Phidget Board closed");
      delete phidgets.client;
    }else{
      throw "Connection to Phidget Board lost.";
    }
  }
};

////////////////////////////////////////////////////////////////////////////
// LOCAL UTILS

var objLenght = function(obj) {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

////////////////////////////////////////////////////////////////////////////
// EXPORT
exports.phidgets = phidgets;
