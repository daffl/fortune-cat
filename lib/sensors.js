var _ = require('underscore');
var phidgets = require('./phidgets').phidgets;

function Normalizer() {
  _.extend(this, {
    last: 0,
    offset: null
  });
}

Normalizer.prototype.update = function(value) {
  if(this.offset === null) {
    this.offset = value - this.last;
  }

  this.current = (10 + value - this.offset) % 10;

  return this.current;
}

Normalizer.prototype.release = function() {
  this.last = this.current;
  this.offset = null;
}


module.exports = function(emitter, config) {
  var params = _.extend({
    version: '1.0.10'
  }, config);
  var errorHandler = function(error) {
    console.error(error.message);
    return emitter.emit('sensorError', error);
  }

  phidgets.connect(params, function(error, phidgetData) {
    if(error) {
      return errorHandler(error);
    }

    console.log(phidgetData);

    var normalizers = {};

    phidgets.on('error', errorHandler);
    phidgets.on('data', function(type, id, value) {
      console.log(arguments);
      if(type === 'Input' && value === 1) {
        emitter.emit('active', id);

        if(!normalizers[id]) {
          normalizers[id] = new Normalizer();
        }
      }

      if(type === 'Input' && value !== 1) {
        emitter.emit('inactive', id);
        normalizers[id].release();
      }

      if(type === 'Sensor' && value < 1000) {
        var current = Math.floor(value / 100);
        var val = normalizers[id].update(current);
        emitter.emit('value', id, val);
      }
    });
  });
}
