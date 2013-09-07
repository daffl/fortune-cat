var phidgets = require('phidgets').phidgets;
var _ = require('underscore');

module.exports = function(config, callback) {
  if(!callback) {
    callback = config;
    config = {};
  }

  var errorHandler = function(e){
    callback(e);
  }
  var params = _.extend({
    version: '1.0.10'
  }, config);

  phidgets.once('error', errorHandler);

  phidgets.connect(params, function(phidgetData){
    phidgets.removeListener('error', errorHandler);
    callback(null, phidgets, phidgetData);
  });
}
