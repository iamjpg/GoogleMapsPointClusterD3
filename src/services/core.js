/*
 * Core model.
 * Responsible for setting up basic services like the Event Emmitter and
 * router bindings via the data-goto attribute.
 */
var Core = (function() {

  var mod = {
    initOnload: function() {
      var self = this;
      window.onload = function() {
        self.bindLinks();
      }
    },
    setEventEmmitter: function() {
      window.EE = require('event-emitter');
    },
    bindLinks: function() {
      document.onclick = function(e) {
        var target = e.target || e.srcElement;
        if (target.dataset.jfgo) {
          router.setRoute(target.dataset.jfgo);
          return false;
        }
      }
    }
  }

  return mod;

})();

// Invoke methods immediately.
Core.initOnload();
Core.setEventEmmitter();

module.exports = Core;
