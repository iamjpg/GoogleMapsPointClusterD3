// Import the MarkerWithLabel library.
import MarkerWithLabel from 'markerwithlabel';

export class Point {

  constructor(map, collection) {
    this.map = map;
    this.collection = collection;
    this.markerListeners = []
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

      self.setEvents(m);

    });
  }

  setEvents(marker) {
    var mouseOverListener = marker.addListener('mouseover', function() {
      this.setZIndex(5000);
    });
    var mouseOutListener = marker.addListener('mouseout', function() {
      this.setZIndex(1000);
    });
    this.markerListeners.push(mouseOverListener)
    this.markerListeners.push(mouseOutListener)
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
