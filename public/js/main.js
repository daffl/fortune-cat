(function ($) {
  var socket = io.connect();
  var getPositions = function(images, height) {
    var result = [];
    var current = 0;

    images.forEach(function (img) {
      result.push(current);
      current += height || img.height;
    });

    return result;
  }
  var mappings = {
    0: '#first'
  }

  $(function () {
    $('#first, #second, #third').fillCanvas({
      folder: 'img/',
      images: ['beakerhead', 'coin', 'crane', 'fan', 'koi',
        'lantern', 'lightbulb', 'robot', 'rocket', 'kitty'],
      width: 200,
      height: 200
    }, function (images) {
      var positions = getPositions(images, 200);
      var setValue = function (id, value) {
        if(!window.fortuneShowing) {
          var id = mappings[id];
          $(id).rotateTo(positions[value]);
        }
      }
      var changed = {};

      socket.on('value', setValue);

      socket.on('active', function (id) {
        $(mappings[id]).addClass('active');
      });

      socket.on('inactive', function (id) {
        $(mappings[id]).removeClass('active');
        changed[id] = true;
        if(_.every(changed)) {
          $('body').trigger('fortune');
          _.each(changed, function(value, key) {
            changed[key] = false;
          });
        }
      });
    });
  });
})(jQuery);
