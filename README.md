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

IMO the current Google Maps Cluster library, [See library here](https://github.com/googlemaps/js-marker-clusterer), is really inefficient when dealing with massive amounts of points as it creates a Google Maps Marker object for each point before clustering them. I figured there had to be a better way.

###  Implementation

Project isn't quite finished yet. In the meantime you can see the implementation in example.js for now.

Implementation details to come.