// Import the MarkerWithLabel library.
import MarkerWithLabel from 'markerwithlabel';
import OverlappingMarkerSpiderfier from '../services/spider-marker';

export class Point {

  constructor(map, collection) {
    this.map = map;
    this.collection = collection;
    this.markerListeners = []
    this.oms = new OverlappingMarkerSpiderfier(this.map, {
      markersWontMove: true,
      markersWontHide: true,
      nearbyDistance: 15,
      keepSpiderfied: true,
      legWeight: 3,
      usualLegZIndex: 25000
    });
  }

  print() {
    var self = this;
    this.markers = [];
    this.collection.forEach(function(o, i) {
      var m = new MarkerWithLabel({
        position: new google.maps.LatLng(o.lat, o.lng),
        map: self.map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 0
        },
        draggable: false,
        labelAnchor: new google.maps.Point(10, 10),
        labelClass: 'marker-point'
      });

      self.markers.push(m);

      self.oms.addMarker(m)

    });

    self.setEvents();

    this.setOmsEvents();

  }

  setOmsEvents() {
    var self = this;

    this.oms.addListener('click', function(marker, event) {

    });

    this.oms.addListener('spiderfy', function(markers, event) {
      self.markers.forEach(function(marker) {
        marker.setOptions({
          zIndex: 1000,
          labelClass: marker.labelClass + " fadePins"
        });
      })
      markers.forEach(function(marker) {
        self.removeListeners()
        marker.setOptions({
          zIndex: 20000,
          labelClass: marker.labelClass.replace(" fadePins", "")
        });
      });
    });

    this.oms.addListener('unspiderfy', function(markers, event) {
      self.markers.forEach(function(marker) {
        marker.setOptions({
          zIndex: 1000,
          labelClass: marker.labelClass.replace(" fadePins", "")
        });
      });
      self.setEvents();
    });

  }

  setEvents() {

    var self = this;
    this.markers.forEach(function(marker) {
      var mouseOverListener = marker.addListener('mouseover', function() {
        this.setZIndex(5000);
      });
      var mouseOutListener = marker.addListener('mouseout', function() {
        this.setZIndex(1000);
      });
      self.markerListeners.push(mouseOverListener)
      self.markerListeners.push(mouseOutListener)
    })


  }

  removeListeners() {
    for (var i = 0; i < this.markerListeners.length; i++) {
      google.maps.event.removeListener(this.markerListeners[i]);
    }
    this.markerListeners = [];
  }

  remove() {
    this.removeListeners();
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(null);
    }
    this.markers = [];
  }

}
