// Import the MarkerWithLabel library.
import MarkerWithLabel from 'markerwithlabel';
import OverlappingMarkerSpiderfier from '../services/spider-marker';
import Popper from '../services/popper';

export class Point {

  constructor(map, collection) {
    this.map = map;
    this.collection = collection;
    this.markerListeners = []
    this.setExternalMouseEvents();
    this.setDocumentClick();
    this.oms = new OverlappingMarkerSpiderfier(this.map, {
      markersWontMove: true,
      markersWontHide: true,
      nearbyDistance: 10,
      keepSpiderfied: true,
      legWeight: 3,
      usualLegZIndex: 25000
    });
  }

  setDocumentClick() {
    const self = this;
    document.addEventListener('click', function (e) {
      const target = e.target;
      if (target.className.indexOf('clicked') === -1) {
        self.removePopper(true);
      }
    });
  }

  print() {
    const self = this;
    this.markers = [];
    this.collection.forEach(function(o, i) {
      // console.log(JSON.parse(JSON.stringify(o)))
      let lat = o.lat || o.location.latitude;
      let lng = o.lng || o.location.longitude;
      let m = new MarkerWithLabel({
        position: new google.maps.LatLng(lat, lng),
        map: self.map,
        hoverContent: o.hoverData || "",
        clickContent: o.clickData || "",
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

    self.setHoverEvents(false);

    this.setOmsEvents();

  }

  setOmsEvents() {
    const self = this;

    this.oms.addListener('click', function(marker, event) {
      self.removePopper();
    });

    this.oms.addListener('spiderfy', function(markers, event) {
      self.removeUniversalPointHoverState();
      self.removePopper();
      self.markers.forEach(function(marker) {
        marker.setOptions({
          zIndex: 1000,
          labelClass: marker.labelClass + " fadePins"
        });
      })
      markers.forEach(function(marker) {
        self.removeListeners();
        self.setHoverEvents(true);
        marker.setOptions({
          zIndex: 20000,
          labelClass: marker.labelClass.replace(" fadePins", "")
        });
      });
    });

    this.oms.addListener('unspiderfy', function(markers, event) {
      self.removeUniversalPointHoverState();
      self.removePopper();
      self.markers.forEach(function(marker) {
        marker.setOptions({
          zIndex: 1000,
          labelClass: marker.labelClass.replace(" fadePins", "")
        });
      });
      self.setHoverEvents(false);
    });

  }

  setExternalMouseEvents() {
    const self = this;
    document.addEventListener('mouseover', function(e) {
      if (e.target.className.indexOf('PinResult') > -1) {
        if (!self.markers[parseInt(e.target.getAttribute('data-pinindex'))]) {
          return false;
        }
        self.markers[parseInt(e.target.getAttribute('data-pinindex'))].setOptions({
          zIndex: 10000,
          labelClass: self.markers[parseInt(e.target.getAttribute('data-pinindex'))].labelClass + " PointHoverState"
        });
      }
    });
    document.addEventListener('mouseout', function(e) {
      if (e.target.className.indexOf('PinResult') > -1) {
        if (!self.markers[parseInt(e.target.getAttribute('data-pinindex'))]) {
          return false;
        }
        self.markers[parseInt(e.target.getAttribute('data-pinindex'))].setOptions({
          zIndex: 100,
          labelClass: self.markers[parseInt(e.target.getAttribute('data-pinindex'))].labelClass.replace(" PointHoverState", "")
        });
      }
    });
  }

  removeUniversalPointHoverState() {
    this.markers.forEach((o, i) => {
      o.setOptions({
        zIndex: 100,
        labelClass: "marker-point"
      });
    })
  }

  setHoverEvents(ignoreZindex=false) {

    // set click events here.
    this.setClickEvents(ignoreZindex);

    const self = this;
    this.markers.forEach(function(marker) {
      let mouseOverListener = marker.addListener('mouseover', function(e) {

        // Remove clicked poppers.
        self.removePopper(true);

        let target = e.target || e.srcElement;
        let m = this;

        // First, set the hover state of the marker
        marker.setOptions({
          zIndex: 10000,
          labelClass: this.labelClass + " PointHoverState"
        });

        // Determine where to place popper right/left
        let mapDivHalfWidth = self.map.getDiv().offsetWidth / 2;
        let markerLeftPos = target.offsetLeft;
        let popperPlacement = (markerLeftPos > mapDivHalfWidth) ? 'top' : 'top';

        let popper = new Popper(
          target, {
            content: m.get('hoverContent'),
            allowHtml: true,
          }, {
            placement: popperPlacement,
            boundariesElement: self.map.getDiv()
          }
        );
        if (!ignoreZindex) {
          this.setZIndex(5000);
        }
      });

      let mouseOutListener = marker.addListener('mouseout', function() {

        // First, remove the hover state of the marker
        marker.setOptions({
          zIndex: 100,
          labelClass: this.labelClass.replace(" PointHoverState", "")
        });
        self.removePopper();
        if (!ignoreZindex) {
          this.setZIndex(1000);
        }
      });
      self.markerListeners.push(mouseOverListener)
      self.markerListeners.push(mouseOutListener)
    });
  }

  setClickEvents(ignoreZindex=false) {

    const self = this;

    this.markers.forEach(function(marker) {
      let mouseOverListener = marker.addListener('click', function(e) {

        // Remove any clicked poppers...
        self.removePopper(true);

        let target = e.target || e.srcElement;
        let m = this;

        let popperPlacement = 'top';

        let popper = new Popper(
          target, {
            content: m.get('clickContent'),
            allowHtml: true,
            classNames: ['popper', 'clicked']
          }, {
            placement: popperPlacement,
            boundariesElement: self.map.getDiv()
          }
        );
      });
    });
  }

  removeListeners() {
    for (let i = 0; i < this.markerListeners.length; i++) {
      google.maps.event.removeListener(this.markerListeners[i]);
    }
    this.markerListeners = [];
  }

  remove() {
    this.removeListeners();
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(null);
    }
  }

  removePopper(clicked=false) {
    let poppers = document.getElementsByClassName('popper');
    for (let i = 0; i < poppers.length; i++) {
      if (!clicked && poppers[i].className.indexOf('clicked') === -1) {
        poppers[i].remove();
      } else if (clicked) {
        poppers[i].remove();
      }
    }
  }

}
