// DOM Ready
document.addEventListener("DOMContentLoaded", function(event) {

  // Create the Google Map.
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 11,
    center: new google.maps.LatLng(37.76487, -122.41948)
  });

  // `Cors` is a simple CORS wrapper for requests.
  Cors.get('example.json', function(res) {
    var response = JSON.parse(res.target.response);

  });

});
