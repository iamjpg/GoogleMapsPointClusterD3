// DOM Ready
document.addEventListener("DOMContentLoaded", function(event) {

  // Create the Google Map.
  window.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: new google.maps.LatLng(37.76487, -122.41948)
  });

  // Construct PointCluster Object
  // @params{object}
  var pc = new PointCluster({
    map: map, // Pass in your map intance you've created above.
    clusterRange: 100 // clusterRange is the pixel grid to cluster. Smaller = more clusters / Larger = less clusters.
  });

  // Map idle listener.
  google.maps.event.addListener(map, 'idle', function() {

    // Get data with d3 JSON call. You can obviously use whatever you please to grab your data.
    d3.json('example.json', function(error, res) {

      // Set the collection of location objects.
      pc.setCollection(res.data.result_list);

      // Print clusters
      pc.print();

    });

  });

});
