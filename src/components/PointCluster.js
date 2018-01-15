// Import library for establishing the convex hull of a cluster of markers.
import convexHull from '../services/convex_hull';

// Import the simple overlay object which allows us to add objects to the Google Maps instance.
import Overlay from '../services/overlay';

// Import the point class which transfers from clusters to markers when under the threshold.
import { Point } from './Point';

// Various helpers to, well, help.
import { Helpers } from '../services/Helpers';

// Import the point publish subscribe pattern.
import PointPubSub from 'vanilla-pubsub';
window.PointPubSub = PointPubSub;

// PointCluster class definition.
export class PointCluster {

  // Constructor -> { options } object
  constructor(options) {

    // Ensure that the Google Maps instance is passed. If not, return an error.
    if (!options.map) {
      return console.error('ERROR: Google map instance is a requirement.');
    }

    // Set object properties with sensible defaults (except the map instance).
    this.map = options.map;
    this.mapContainer = options.mapContainer || 'map';
    this.clusterRange = options.clusterRange || 300;
    this.threshold = options.threshold || 200;
    this.clusterRgba = options.clusterRgba || '51, 102, 153, 0.8';
    this.clusterBorder = options.clusterBorder || '5px solid #ccc';
    this.polygonStrokeColor = options.polygonStrokeColor || '#336699';
    this.polygonStrokeOpacity = options.polygonStrokeOpacity || '0.5';
    this.polygonStrokeWeight = options.polygonStrokeWeight || '4';
    this.polygonFillColor = options.polygonFillColor || '#336699';
    this.polygonFillOpacity = options.polygonFillOpacity || '0.2';
    this.customPinHoverBehavior = options.customPinHoverBehavior || false;
    this.customPinClickBehavior = options.customPinClickBehavior || false;

    // Set map events.
    this.setMapEvents();
  }

  // setCollection() is responsible for setting the collection of lat/lng objects.
  setCollection(collection) {

    var helpers = new Helpers;

    // Collection is required. Throw error if not set.
    if (!collection) {
      return console.error('Please pass an array of location objects. Ignore if running tests.');
    }

    // Set collection on the PointCluster object.
    this.collection = collection;
    window.collection = helpers.clone(collection);
  }

  // createOverlay() is responsible for creating the div which we will append clusters and pins to.
  createOverlay() {
    if (this.overlay) {
      this.overlay.setMap(null);
    }
    this.overlay = new Overlay(this.map);
    this.overlay.setMap(this.map);
    window.overlay = this.overlay;
  }

  checkIfLatLngInBounds() {
    var helpers = new Helpers;
    var self = this;
    var arr = helpers.clone(this.collection);
    for (var i=0; i < arr.length; ++i) {
      let lat = arr[i].lat || arr[i].location.latitude;
      let lng = arr[i].lng || arr[i].location.longitude;
      if (!self.map.getBounds().contains(new google.maps.LatLng(lat, lng))) {
        arr.splice(i, 1);
        --i; // Correct the index value
      }
    }
    return arr;
  }

  // print() is reponsible for calling D3 methods to convert `this.collection` into quadtree points.
  print() {
    var self = this;

    // Set the projection, create quadtree, and get centerpoints.
    var projection = d3.geoMercator();
    var path = d3.geoPath().projection(projection).pointRadius(1);
    var quadtree = d3.quadtree().addAll(this.returnPointsRaw());
    var centerPoints = this.getCenterPoints(quadtree);

    // Create the overlay div to append to.
    this.createOverlay();

    if (self.points) { self.points.remove(); }

    // Unfortunate setInterval as it takes a moment for Google to append their overlay div. Possibly refactor with requestAnimationFrame().
    var overlayInterval = setInterval(function() {
      if (document.getElementById('point_cluster_overlay')) {
        clearInterval(overlayInterval);
        if (self.checkIfLatLngInBounds().length <= self.threshold) {
          self.overlay.setMap(null);
          self.points = window.PointClusterPoints = new Point(self.map, self.checkIfLatLngInBounds(), self.customPinClickBehavior, self.customPinHoverBehavior);
          self.points.print();
          PointPubSub.publish('Point.count', self.points.collection.length)
          PointPubSub.publish('Point.show', self.points.collection)
        } else {
          PointPubSub.publish('Point.count', self.checkIfLatLngInBounds().length)
          self.paintClustersToCanvas(centerPoints);
        }
      }
    }, 10);
  }

  paintClustersToCanvas(points) {
    var self = this;
    var frag = document.createDocumentFragment();
    var helpers = new Helpers;

    // Loop over points assessing
    points.forEach(function(o, i) {
      var clusterCount = o[2].length;

      var div = document.createElement('div');
      div.className = 'point-cluster ' + helpers.returnClusterClassObject(clusterCount.toString().length).classSize;
      div.style.backgroundColor = 'rgba(' + self.clusterRgba + ')';
      div.dataset.positionid = i;
      var latLngPointerArray = [];

      o[2].forEach(function(a, b) {
        latLngPointerArray.push(a[2]);
      });

      // START - Center cluster icon inside of Polygon.

      var polygonCoords = []
      var pi;
      var mapProjections = helpers.returnMapProjections(self.map);

      latLngPointerArray.forEach(function(o, i) {
        var pointer = self.collection[parseInt(o)];
        polygonCoords.push(new google.maps.LatLng(pointer.lat, pointer.lng))
      });

      for (pi = 0; pi < polygonCoords.length; pi++) {
        mapProjections.bounds.extend(polygonCoords[pi]);
      }

      var point = mapProjections.projection.fromLatLngToPoint(
        new google.maps.LatLng(mapProjections.bounds.getCenter().lat(), mapProjections.bounds.getCenter().lng())
      );

      // Get the x/y based on the scale.
      var x = parseInt((point.x - mapProjections.bottomLeft.x) * mapProjections.scale);
      var y = parseInt((point.y - mapProjections.topRight.y) * mapProjections.scale);

      div.style.left = (x - helpers.returnClusterClassObject(clusterCount.toString().length).offSet) + 'px';
      div.style.top = (y - helpers.returnClusterClassObject(clusterCount.toString().length).offSet) + 'px';

      // END - Center cluster icon inside of Polygon.

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

      if (self.collection) {
        self.print();
      }
    });
  }

  zoomToFit(el) {
    var self = this;
    var collectionIds = el.dataset.latlngids.split(',');
    var points = [];
    var points_alt = [];
    collectionIds.forEach(function(o, i) {
      var pointer = self.collection[parseInt(o)];
      points_alt.push({
        x: pointer.lat,
        y: pointer.lng
      });
    });
    points_alt = convexHull(points_alt);
    points_alt.forEach(function(o, i) {
      points.push(new google.maps.LatLng(o.x, o.y));
    });
    var latlngbounds = new google.maps.LatLngBounds();
    for (var i = 0; i < points.length; i++) {
      latlngbounds.extend(points[i]);
    }

    requestAnimationFrame(function() {
      // self.map.fitBounds(latlngbounds);
      const center_lat = latlngbounds.getCenter().lat();
      const center_lng = latlngbounds.getCenter().lng();
      const current_zoom = self.map.getZoom();
      self.map.setCenter(new google.maps.LatLng(center_lat, center_lng));
      self.map.setZoom(current_zoom + 1);
    });
  }

  returnPointsRaw() {

    // Projection variables.
    var helpers = new Helpers;
    var mapProjections = helpers.returnMapProjections(this.map);

    this.pointsRawLatLng = []

    return this.collection.map(function(o, i) {

      // Create our point.
      var point = mapProjections.projection.fromLatLngToPoint(
        new google.maps.LatLng(o.lat, o.lng)
      );

      // Get the x/y based on the scale.
      var x = (point.x - mapProjections.bottomLeft.x) * mapProjections.scale;
      var y = (point.y - mapProjections.topRight.y) * mapProjections.scale;

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
      var p = node.data;
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

    for (var x = 0; x <= document.getElementById(this.mapContainer).offsetWidth; x += this.clusterRange) {
      for (var y = 0; y <= document.getElementById(this.mapContainer).offsetHeight; y += this.clusterRange) {
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

    // Push the first lat/lng point to the end to close the polygon.
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
      strokeColor: self.polygonStrokeColor,
      strokeOpacity: self.polygonStrokeOpacity,
      strokeWeight: self.polygonStrokeWeight,
      fillColor: self.polygonFillColor,
      fillOpacity: self.polygonFillOpacity
    });

    this.polygon.setMap(self.map);
  }

  removePolygon() {
    if (this.polygon === undefined) { return false; }
    this.polygon.setMap(null);
  }

}
