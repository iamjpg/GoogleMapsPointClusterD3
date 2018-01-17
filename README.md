# Google Maps Clustering Using D3.JS

A simple to use, very fast, point clustering library for Google maps. Uses other amazing open source projects to accomplish goal. Credits below.

### Demo

[Clusering Demo Here](http://iamjpg.github.io/GoogleMapsPointClusterD3/)

### First, a thank you to the open source libraries used in this project.

1. [D3JS](https://d3js.org/) - Without it the complex quadtree math would have been impossible for my tiny brain.
2. [Google Maps Overlapping Marker Spiderfier](https://github.com/jawj/OverlappingMarkerSpiderfier) used to spider overlapping markers.

Also, a special thank you to these D3 projects and articles that allowed me to figure out how to accomplish this task:

1. [https://www.phase2technology.com](https://www.phase2technology.com/blog/using-d3-quadtrees-to-power-an-interactive-map-for-bonnier-corporation/) wrote a great blog post about utilizing D3 to accomplish complex clustering.
2. [https://thoughbot.com](https://robots.thoughtbot.com/how-to-handle-large-amounts-of-data-on-maps) wrote possibly the best article I had come across on how to accomplish this with ObjectiveC example code.
3. [http://bl.ocks.org/mbostock/4343214](http://bl.ocks.org/mbostock/4343214) one of many great D3 examples out in the internet.

### Why?

IMO, the current Google Maps Cluster library, [See library here](https://github.com/googlemaps/js-marker-clusterer), is really inefficient when dealing with massive amounts of points as it creates a Google Maps Marker object for each point before clustering them.

###  Basic Implementation

##### Required Libraries

```
<script src="//maps.google.com/maps/api/js?key={YOUR_KEY}"></script>
<script src="//d3js.org/d3.v4.min.js"></script>
<script src="//d3js.org/d3-quadtree.v1.min.js"></script>
```

##### Expected data structure

```javascript
// example.js
{
  "data": {
    "result_list": [
      {
        "lat": 39.498234,
        "lng": -121.54583,
        ... more
      },
      ... more...
    ]
  }
}
```

##### Create a Point Cluster Instance

```javascript
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
```

##### Get your data and set your point collection on the instance

```javascript
// Get example.js
d3.json('example.json', function(error, res) {
  // In this example, we're mutating the results to add data attributes, hover data, and click data. This can obviously be done without mutation... 
  res.data.result_list.forEach(function(o, i) {
    o.hoverData = o.lat + " : " + o.lng;
    o.dataset = [{foo: 'bar'}] // Dataset is an array of objects. This would add: data-foo="bar" to marker points.
    o.clickData = "You've clicked on this locaton:<br />" + o.lat + " : " + o.lng; // Data to present on click of a marker point
  });
  // Set the collection of location objects.
  pc.setCollection(res.data.result_list);

  // Print clusters
  pc.print();
})
```

### Coming soon

1. Better examples on how to utilize this library.
2. Tricks for styling markers. 