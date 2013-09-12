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
    var elements = ['#first', '#second', '#third'];
    var index = 0;

    $('#first, #second, #third').fillCanvas({
      folder: 'img/',
      images: ['beakerhead', 'coin', 'crane', 'fan', 'koi',
        'lantern', 'lightbulb', 'robot', 'rocket', 'kitty'],
      width: 200,
      height: 200
    }, function (images) {
      var positions = getPositions(images, 200);
      var getElement = function(id) {
        // var selector = mappings[id];
        var selector = elements[index];
        return $(selector);
      }
      var setValue = function (id, value) {
        if(!window.fortuneShowing) {
          getElement(id).rotateTo(positions[value]);
        }
      }
      var changed = { 0: false, 1: false, 2: false };

      socket.on('value', setValue);

      socket.on('active', function (id) {
        if(id === 0 && !window.fortuneShowing) {
          getElement(id).addClass('active');
        }
      });

      socket.on('inactive', function (id) {
        if(id === 0 && !window.fortuneShowing) {
          getElement(id).removeClass('active').addClass('done');
          index = (++index) % elements.length;
          changed[index] = true;
          if(_.every(changed)) {
            $('body').trigger('fortune');
            _.each(changed, function(value, key) {
              changed[key] = false;
            });
          }
        }
      });
    });
  });
})(jQuery);
