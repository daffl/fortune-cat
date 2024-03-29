(function ($) {
  var requestAnimationFrame = (function () {
    return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function (/* function */ callback, /* DOMElement */ element) {
        window.setTimeout(callback, 1000 / 60);
      };
  })();

  function Rotator(el) {
    this.vendor =
      (/webkit/i).test(navigator.appVersion) ? '-webkit' :
        (/firefox/i).test(navigator.userAgent) ? '-moz' :
          (/msie/i).test(navigator.userAgent) ? 'ms' :
            'opera' in window ? '-o' : '';

    this.cssTransform = this.vendor + '-transform';
    this.has3d = ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix())
    this.trnOpen = 'translate' + (this.has3d ? '3d(' : '(');
    this.trnClose = this.has3d ? ',0)' : ')';
    this.el = el;
    this.speed = 10;
    this.position = 0;
  }

  Rotator.prototype.setTarget = function (target) {
    this.target = -target;
    return this;
  }

  Rotator.prototype.run = function () {
    var self = this;
    this.running = true;
    this.el.addClass('rotating');
    (function loop() {
      self.draw();
      if (self.running) {
        requestAnimationFrame(loop);
      }
    })();
  }

  Rotator.prototype.setPosition = function(pos) {
    this.running = false;
    this.position = pos;
    this.draw();
  }

  Rotator.prototype.draw = function () {
    // translate canvas location
    if (this.position === this.target) {
      this.el.removeClass('rotating');
      this.position = this.target;
      this.running = false;
    } else if (this.position < this.target) {
      // Up
      this.position += this.speed;
    } else {
      // Down
      this.position -= this.speed;
    }

    this.el.css(this.cssTransform, this.trnOpen + '0px, ' + this.position + 'px' + this.trnClose);
  }

  $.fn.rotateTo = function (target) {
    var r = $(this).data('rotator') || new Rotator(this);
    r.setTarget(target).run();
    return $(this).data('rotator', r);
  }
})(jQuery);
