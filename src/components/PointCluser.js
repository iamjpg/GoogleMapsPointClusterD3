export class PointCluster {

  constructor(options) {
    if (!options.map) { return console.error('ERROR: Google map instance is a requirement.'); }
    this.map = options.map;
    this.threshold = options.threshold || 200;
  }

  setCollection(collection) {
    if (!collection) { return console.error('Please pass an array of location objects.'); }
    this.collection = collection;
  }

  print() {
    var projection = d3.geo.mercator();
    var path = d3.geo.path().projection(projection).pointRadius(1);
    console.log(this.returnPointsRaw())
    var quadtree = d3.geom.quadtree()(this.returnPointsRaw());

    this.getCenterPoints(quadtree);
  }

  returnPointsRaw() {

    // Projection variables.
		var projection = this.map.getProjection();
		var topRight = projection.fromLatLngToPoint(this.map.getBounds().getNorthEast());
		var bottomLeft = projection.fromLatLngToPoint(this.map.getBounds().getSouthWest());
		var scale = Math.pow(2, this.map.getZoom());

    return this.collection.map(function(o, i) {

      // Create our point.
  		var point = projection.fromLatLngToPoint(
  			new google.maps.LatLng(o.lat,o.lng)
  		);

  		// Get the x/y based on the scale.
  		var x = (point.x - bottomLeft.x) * scale;
  		var y = (point.y - topRight.y) * scale;

      return [
        x,
        y,
        i
      ]
    });
  }

  searchQuadTree(quadtree, x0, y0, x3, y3) {
    var validData = [];
    quadtree.visit(function(node, x1, y1, x2, y2) {
      var p = node.point;
      if (p !== null) {
        console.log(p)
      }
      if (p) {
        p.selected = (p[0] >= x0) && (p[0] < x3) && (p[1] >= y0) && (p[1] < y3);
        if (p.selected) {
          validData.push(p);
        }
      }
      return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
    });
    // console.log(validData)
    return validData;
  }

  getCenterPoints(quadtree) {

    console.log(quadtree)

    var clusterPoints = [];
    var clusterRange = 45;

    for (var x = 0; x <= document.getElementById('map').offsetWidth; x += clusterRange) {
      for (var y = 0; y <= document.getElementById('map').offsetHeight; y+= clusterRange) {
        var searched = this.searchQuadTree(quadtree, x, y, x + clusterRange, y + clusterRange);

        var centerPoint = searched.reduce(function(prev, current) {
          return [prev[0] + current[0], prev[1] + current[1]];
        }, [0, 0]);

        centerPoint[0] = centerPoint[0] / searched.length;
        centerPoint[1] = centerPoint[1] / searched.length;
        centerPoint.push(searched);

        if (centerPoint[0] && centerPoint[1]) {
          clusterPoints.push(centerPoint);
        }
      }
    }

    return clusterPoints;

  }

}
