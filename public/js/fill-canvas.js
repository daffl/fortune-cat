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

  var getHeight = function(images) {
    var result = 0;
    images.forEach(function (img) {
      result += img.height;
    });

    return result;
  }

  var getWidth = function(images) {
    var result = 0;
    images.forEach(function (img) {
      result = Math.max(result, img.width);
    });

    return result;
  }

  // Images must be preloaded before they are used to draw into canvas
  var preloadImages = function (folder, images, callback) {
    var results = [];

    function _preload(id) {
      var img = new Image();
      img.src = folder + id + '.png';

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
  var _fill_canvas = function (canvas, items, options) {
    var singleHeight = getHeight(items);
    var currentPosition = 0;
    var ctx = canvas.getContext('2d');

    for (var i = 0; i < items.length; i++) {
      var img = items[i];
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;
      ctx.shadowBlur = 5;

      if(options.width && options.height) {
        ctx.drawImage(img, 0, currentPosition, options.width, options.height);
        currentPosition += options.height;
      } else {
        ctx.drawImage(img, 0, currentPosition);
        currentPosition += img.height;
      }

      if(options.repeat) {
        ctx.drawImage(img, 3, currentPosition + singleHeight);
      }

      ctx.restore();
    }
  }

  $.fn.fillCanvas = function (options, callback) {
    var self = this;
    var srcs = options.images;

    preloadImages(options.folder || '', srcs, function (images) {
      var finalHeight = options.height ? options.height * images.length : getHeight(images);
      var maxWidth = options.width || getWidth(images);

      if(options.repeat) {
        finalHeight = finalHeight * 2;
      }

      self.attr('width', maxWidth);
      self.css('width', maxWidth);
      self.attr('height', finalHeight);
      self.css('height', finalHeight);

      self.each(function () {
        _fill_canvas(this, shuffleArray(images), options);
      });

      if(callback) {
        callback.call(self, images);
      }
    });
  }
})(jQuery);
