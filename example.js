// DOM Ready
document.addEventListener("DOMContentLoaded", function(event) {

  // Create the Google Map.
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 11,
    center: new google.maps.LatLng(37.76487, -122.41948)
  });

  // Construct PointCluster Object
  // @params{object} - map instance required.
  var pc = new PointCluster({
    map: map
  });

  // Get data with d3 JSON call.
  d3.json('example.json', function(error, res) {

    // Set the collection of location objects.
    pc.setCollection(res.data.result_list);
  });

});
