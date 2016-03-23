// Import library for establishing the convex hull of a cluster of markers
import convexHull from '../services/convex_hull';

// Import the simple overlay object which allows us to add object to the Google Maps instance
import Overlay from '../services/overlay';


export class PointCluster {

  constructor(options) {
    if (!options.map) {
      return console.error('ERROR: Google map instance is a requirement.');
    }
    this.map = options.map;
    this.clusterRange = options.clusterRange || 300;
    this.threshold = options.threshold || 200;
    this.setMapEvents();
  }

  setCollection(collection) {
    if (!collection) {
      return console.error('Please pass an array of location objects. Ignore if running tests.');
    }
    this.collection = collection;
  }

  createOverlay() {
    if (document.getElementById('point_cluster_overlay')) { return false; }
    var overlay = new Overlay();
    overlay.setMap(this.map);
  }

  print() {
    var self = this;
    var projection = d3.geo.mercator();
    var path = d3.geo.path().projection(projection).pointRadius(1);
    var quadtree = d3.geom.quadtree()(this.returnPointsRaw());
    var centerPoints = this.getCenterPoints(quadtree);
    this.createOverlay();
    var overlayInterval = setInterval(function() {
      if (document.getElementById('point_cluster_overlay')) {
        clearInterval(overlayInterval);
        self.paintPinsToCanvas(centerPoints);
      }
    });
  }

  paintPinsToCanvas(points) {
    var self = this;
    var frag = document.createDocumentFragment();

    points.forEach(function(o, i) {
      var clusterCount = o[2].length;
      var classSize;
      if (clusterCount.toString().length >= 3) {
        classSize = 'large';
      } else if (clusterCount.toString().length == 2) {
        classSize = 'medium';
      } else {
        classSize = 'small';
      }
      var div = document.createElement('div');
      div.className = 'point-cluster ' + classSize;
      div.style.left = o[0] + 'px';
      div.style.top = o[1] + 'px';
      div.dataset.positionid = i;
      var latLngPointerArray = [];
      o[2].forEach(function(a, b) {
        latLngPointerArray.push(a[2]);
      });
      div.dataset.latlngids = latLngPointerArray.join(',')
      div.innerHTML = clusterCount;
      frag.appendChild(div);
      self.setClusterEvents(div)
    });

    document.getElementById('point_cluster_overlay').appendChild(frag);

  }

  setClusterEvents(el) {
    var self = this;
    el.onmouseover = function() {
      self.showPolygon(this);
    }
    el.onmouseout = function() {
      self.removePolygon();
    }
    el.onclick = function() {
      self.removeElements();
      self.removePolygon();
      self.zoomToFit(this);
    }
  }

  setMapEvents() {
    var self = this;
    google.maps.event.addListener(this.map, 'idle', function() {
      self.removeElements();
    });
  }

  zoomToFit(el) {
    var self = this;
    var collectionIds = el.dataset.latlngids.split(',');
    var points = [];
    collectionIds.forEach(function(o, i) {
      var pointer = self.collection[parseInt(o)];
      points.push(new google.maps.LatLng(pointer.lat, pointer.lng))
    });
    var latlngbounds = new google.maps.LatLngBounds();
    for (var i = 0; i < points.length; i++) {
      latlngbounds.extend(points[i]);
    }
    this.map.fitBounds(latlngbounds);
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
        new google.maps.LatLng(o.lat, o.lng)
      );

      // Get the x/y based on the scale.
      var x = (point.x - bottomLeft.x) * scale;
      var y = (point.y - topRight.y) * scale;

      return [
        x - 25,
        y - 25,
        i
      ]
    });
  }

  searchQuadTree(quadtree, x0, y0, x3, y3) {
    var validData = [];
    quadtree.visit(function(node, x1, y1, x2, y2) {
      var p = node.point;
      if (p) {
        p.selected = (p[0] >= x0) && (p[0] < x3) && (p[1] >= y0) && (p[1] < y3);
        if (p.selected) {
          validData.push(p);
        }
      }
      return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
    });
    return validData;
  }

  getCenterPoints(quadtree) {

    var clusterPoints = [];

    for (var x = 0; x <= document.getElementById('map').offsetWidth; x += this.clusterRange) {
      for (var y = 0; y <= document.getElementById('map').offsetHeight; y += this.clusterRange) {
        var searched = this.searchQuadTree(quadtree, x, y, x + this.clusterRange, y + this.clusterRange);

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

  removeElements() {
    var elements = document.getElementsByClassName('point-cluster');
    while (elements.length > 0) {
      elements[0].parentNode.removeChild(elements[0]);
    }
  }

  showPolygon(el) {

    var self = this;

    var collectionIds = el.dataset.latlngids.split(',');

    collectionIds.push(collectionIds[0])

    var points = []

    collectionIds.forEach(function(o, i) {
      var pointer = self.collection[parseInt(o)];
      points.push({
        x: pointer.lat,
        y: pointer.lng
      })
    });

    var points = convexHull(points);
    points = points.map(function(item) {
      return {
        lat: item.x,
        lng: item.y
      }
    })

    this.polygon = new google.maps.Polygon({
      paths: points,
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 3,
      fillColor: '#FF0000',
      fillOpacity: 0.35
    });

    this.polygon.setMap(self.map);
  }

  removePolygon() {
    this.polygon.setMap(null);
  }

}
