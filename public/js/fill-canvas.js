(function($) {
  function shuffleArray( array ) {
    var result = array.slice(0);

    for (i = result.length - 1; i > 0; i--) {
      var j = parseInt(Math.random() * i)
      var tmp = result[i];
      result[i] = result[j]
      result[j] = tmp;
    }

    return result;
  }

  // Images must be preloaded before they are used to draw into canvas
  var preloadImages = function (images, callback) {
    var results = [];

    function _preload(id) {
      var img = new Image();
      img.src = 'img/' + id + '.png';

      img.addEventListener("load", function () {
        _check();
      }, false);

      img.addEventListener("error", function (err) {
        _check(err, img.src);
      }, false);

      results.push(img);
    }

    var loadc = 0;

    function _check(err, id) {
      if (err) {
        alert('Failed to load ' + id);
      }
      loadc++;
      if (images.length == loadc) {
        return callback(results);
      }
    }

    images.forEach(_preload);
  }

  // draws canvas strip
  var _fill_canvas = function (canvas, items) {
    var currentPosition = 0;
    var ctx = canvas.getContext('2d');

    for (var i = 0; i < items.length; i++) {
      var img = items[i];
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;
      ctx.shadowBlur = 5;
      ctx.drawImage(img, 0, currentPosition);
      // ctx.drawImage(img, 3, (i + items.length) * img.height + options.marginTop);
      ctx.restore();
      // ctx.fillRect(0, currentPosition, img.width, options.separator);
      // ctx.fillRect(0, (i + ITEM_COUNT) * SLOT_HEIGHT, 70, SLOT_SEPARATOR_HEIGHT);
      currentPosition += img.height;
    }
  }

  $.fn.fillCanvas = function (srcs, callback) {
    var self = this;

    preloadImages(srcs, function (images) {
      var finalHeight = 0;

      images.forEach(function (img) {
        finalHeight += img.height;
      });

      self.attr('width', 200);
      self.css('width', 200);
      self.attr('height', finalHeight);
      self.css('height', finalHeight);

      self.each(function () {
        _fill_canvas(this, shuffleArray(images));
      });

      if(callback) {
        callback.call(self, images);
      }
    });
  }
})(jQuery);
