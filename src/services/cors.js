var CORS = (function(){
  var module = {
    get: function(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.open("get", url, true);
      xhr.onload = function(res) {
        callback(res);
      };
      xhr.send(null);
    }
  }
  return module;
})();

module.exports = CORS;