// DOM Ready
document.addEventListener("DOMContentLoaded", function(event) {

  // Create the Google Map.
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: new google.maps.LatLng(37.76487, -122.41948)
  });

  // Construct PointCluster Object
  // @params{object} - map instance required.
  var pc = new PointCluster({
    map: map
  });

  google.maps.event.addListener(map, 'idle', function() {

    pc.removeElements();

    // Set the current bounds and center of the map to pass to service.
    var ne_lat, ne_lng, sw_lat, sw_lng, c_lat, c_lng;
    ne_lat = map.getBounds().getNorthEast().lat();
    ne_lng = map.getBounds().getNorthEast().lng();
    sw_lat = map.getBounds().getSouthWest().lat();
    sw_lng = map.getBounds().getSouthWest().lng();
    c_lat = map.getCenter().lat();
    c_lng = map.getCenter().lng();

    // Sample call to listing service returning listings within map bounds to illustrate implementation.
    $.ajax({
      url: 'http://svc.windermere.com/service/v1/listing/search?status=active&bounds_north=' + ne_lat + '&bounds_south=' + sw_lat + '&bounds_east=' + ne_lng + '&bounds_west=' + sw_lng + '&center_lat=' + c_lat + '&center_lon=' + c_lng + '&ptype=1,2' + '&cluster_allow=1&cluster_threshold=100&user_uuid=3c2b0dba-435c-45a5-8ff7-6c1f05d33943',
      dataType: 'jsonp',
      success: function(res) {

        // Set the collection of location objects.
        pc.setCollection(res.data.result_list);

        // Print clusters
        pc.print();
      }
    });


    /*
    // Get data with d3 JSON call. Use jQuery or CORS - doesn't matter.
    d3.json('example.json', function(error, res) {

      // Set the collection of location objects.
      pc.setCollection(res.data.result_list);

      // Print clusters
      pc.print();

    });
    */

  });

});
