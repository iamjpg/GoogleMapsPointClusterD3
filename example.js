// DOM Ready
document.addEventListener("DOMContentLoaded", function(event) {

  // Create the Google Map.
  window.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 6,
    center: new google.maps.LatLng(37.76487, -122.41948)
  });

  // Construct PointCluster Object
  // @params{object}
  var pc = new PointCluster({
    map: map, // Pass in your map intance.
    clusterRange: 300, // clusterRange is the pixel grid to cluster. Smaller = more clusters / Larger = less clusters.
    threshold: 300, // Threshold is the number of results before showing markers,
    clusterRgba: '255, 0, 102, .8', // Change the background of the cluster icon. RGBA only.
    clusterBorder: '5px solid #dcdcdc', // Change the border around the icon. HEX only.
    polygonStrokeColor: '#0f0f0e', // Polygon stroke color.
    polygonStrokeOpacity: '0.5', // Polygon stroke opacity.
    polygonStrokeWeight: '4', // Polygon stroke weight.
    polygonFillColor: '#0f0f0e', // Polygom fill color.
    polygonFillOpacity: '0.2', // Polygon fill color.
    customPinHoverBehavior: false, // If the user of the lib would rather not use internal overlay and opt for their own hover behavior.
    customPinClickBehavior: false // If the user of the lib would rather not use internal overlay and opt for their own click behavior.
  });

  // Map idle listener.
  google.maps.event.addListenerOnce(map, 'idle', function() {

    // Get data with d3 JSON call. You can obviously use whatever you please to grab your data.
    d3.json('example.json', function(error, res) {

      res.data.result_list.forEach(function(o, i) {
        o.hoverData = o.lat + " : " + o.lng;
        o.dataset = [{bar: 'boop'}]
        o.clickData = "You've clicked on this locaton:<br />" + o.lat + " : " + o.lng;
      });

      // Set the collection of location objects.
      pc.setCollection(res.data.result_list);

      // Print clusters
      pc.print();

      PointPubSub.subscribe('Point.count', function(res) {
        var container = document.getElementById('count');
        container.innerHTML = 'Currently showing <b>' + res + '</b> points.'

        if (parseInt(res) > pc.threshold) {
          var results_div = document.getElementById('results');
          results_div.innerHTML = '';
          container.innerHTML = container.innerHTML + ' To see markers, get below the threshold of ' + pc.threshold + ' points.'
        }
      });

      PointPubSub.subscribe('Point.click', function(target) {
        console.log(target)
      })

      PointPubSub.subscribe('Point.show', function(res) {
        var results_div = document.getElementById('results');
        results_div.innerHTML = '';
        res.forEach(function(o, i) {
          var p = document.body.appendChild(document.createElement("p"));
          p.innerHTML = o.lat + ', ' + o.lng;
          p.classList.add('PinResult');
          p.setAttribute('data-pinindex', i);
          results_div.appendChild(p);
        });
      });

    });

  });

});
