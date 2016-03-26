// Import the MarkerWithLabel library.
import MarkerWithLabel from 'markerwithlabel';

export class Point {

  constructor(map, collection) {
    this.map = map;
    this.collection = collection;
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

    });
  }

  remove() {
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(null);
    }
  }

}
