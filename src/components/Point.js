// Import the MarkerWithLabel library.
import MarkerWithLabel from 'markerwithlabel';
import OverlappingMarkerSpiderfier from '../services/spider-marker';

export class Point {

  // Constructor -> { options } object
  constructor(map, collection, customPinClickBehavior=false, customPinHoverBehavior=false) {
    this.map = map;
    this.collection = collection;
    this.markerListeners = []
    this.customPinClickBehavior = customPinClickBehavior;
    this.customPinHoverBehavior = customPinHoverBehavior;
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

  returnHoverTemplate() {
    const template = `
      <div id="popper-container">
        <div class="arrow_box">

        </div>
      </div>
    `
    return template;
  }

  returnClickTemplate() {
    const template = `
      <div id="popper-container-clicked">
        <div class="arrow_box_clicked">

        </div>
      </div>
    `
    return template;
  }

  // Document click is to simply remove a clicked popper if user
  // clicks away.
  setDocumentClick() {
    const self = this;
    document.addEventListener('click', function(e) {
      const target = e.target;
      if (target.className.indexOf('clicked') === -1) {
        self.removePopper(true);
      }
    });
  }

  // Print the points when under threshold.
  print() {
    const self = this;
    this.markers = [];
    this.collection.forEach(function(o, i) {
      let lat = o.lat || o.location.latitude;
      let lng = o.lng || o.location.longitude;
      let m = new MarkerWithLabel({
        position: new google.maps.LatLng(lat, lng),
        map: self.map,
        hoverContent: o.hoverData || "",
        clickContent: o.clickData || "",
        labelContent: '',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 0
        },
        draggable: false,
        labelAnchor: new google.maps.Point(10, 10),
        labelClass: 'marker-point',
        data: o.dataset
      });

      self.markers.push(m);

      self.oms.addMarker(m)

      if (document.querySelector('#popper-container') === null) {
        let temp = document.createElement('template');
        temp.innerHTML = self.returnHoverTemplate();
        self.map.getDiv().appendChild(temp.content);
      }

      if (document.querySelector('#popper-container-clicked') === null) {
        let temp = document.createElement('template');
        temp.innerHTML = self.returnClickTemplate();
        self.map.getDiv().appendChild(temp.content);
      }

    });

    self.setHoverEvents(false);

    this.setOmsEvents();

  }

  // Init the point spiderification.
  setOmsEvents() {
    const self = this;

    this.oms.addListener('click', function(marker, event) {
      self.removePopper();
    });

    this.oms.addListener('spiderfy', function(markers, event) {
      self.removeUniversalPointHoverState();
      requestAnimationFrame(() => {
        self.removePopper(true);
      });
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

  // Various events for the points.
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

  // A universal point method for removing the hoverstate of all pins.
  removeUniversalPointHoverState() {
    this.markers.forEach((o, i) => {
      o.setOptions({
        zIndex: 100,
        labelClass: "marker-point"
      });
    })
  }

  // Set the hover events.
  setHoverEvents(ignoreZindex = false) {

    // set click events here.
    this.setClickEvents(ignoreZindex);

    if (this.customPinHoverBehavior) {
      return false;
    }

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

        if (m.get('hoverContent') === "") {
          return false;
        }

        // Pointers
        let map = this.map;

        // Get projection data
        let projection = map.getProjection();
        let topRight = projection.fromLatLngToPoint(map.getBounds().getNorthEast());
        let bottomLeft = projection.fromLatLngToPoint(map.getBounds().getSouthWest());
        let scale = Math.pow(2, map.getZoom());

        // Create point
        var point = projection.fromLatLngToPoint(
          new google.maps.LatLng(m.internalPosition.lat(), m.internalPosition.lng())
        );

        // Show the bubble
        let elem = document.querySelector('#popper-container');
        let inner = document.querySelector('.arrow_box');
        inner.innerHTML = m.get('hoverContent');
        elem.style.display = 'block';

        // Get the x/y based on the scale.
        let containerHeight = elem.offsetHeight;
        let containerWidth = elem.offsetWidth;
        var posLeft = parseInt(((point.x - bottomLeft.x) * scale) - (containerWidth / 2 + 4));
        var posTop = parseInt(((point.y - topRight.y) * scale) - (20 + containerHeight));

        elem.style.top = `${posTop}px`;
        elem.style.left = `${posLeft}px`;

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

  // Set the click events.
  setClickEvents(ignoreZindex = false) {

    const self = this;

    this.markers.forEach(function(marker) {
      let mouseClickListener = marker.addListener('click', function(e) {

        // PubSub this event - passing the element.
        PointPubSub.publish('Point.click', e)

        if (self.customPinClickBehavior) {
          return false;
        }

        // Remove any clicked poppers...
        self.removePopper(true);

        let target = e.target || e.srcElement;
        let m = this;

        if (m.get('clickContent') === "") {
          return false;
        }

        // Pointers
        let map = this.map;

        // Get projection data
        let projection = map.getProjection();
        let topRight = projection.fromLatLngToPoint(map.getBounds().getNorthEast());
        let bottomLeft = projection.fromLatLngToPoint(map.getBounds().getSouthWest());
        let scale = Math.pow(2, map.getZoom());

        // Create point
        var point = projection.fromLatLngToPoint(
          new google.maps.LatLng(m.internalPosition.lat(), m.internalPosition.lng())
        );

        // Show the bubble
        let elem = document.querySelector('#popper-container-clicked');
        let inner = document.querySelector('.arrow_box_clicked');
        inner.innerHTML = m.get('clickContent');
        elem.style.display = 'block';

        // Get the x/y based on the scale.
        let containerHeight = elem.offsetHeight;
        let containerWidth = elem.offsetWidth;
        var posLeft = parseInt(((point.x - bottomLeft.x) * scale) - (containerWidth / 2 + 4));
        var posTop = parseInt(((point.y - topRight.y) * scale) - (20 + containerHeight));

        elem.style.top = `${posTop}px`;
        elem.style.left = `${posLeft}px`;

      });
    });
  }

  // Remove listeners.
  removeListeners() {
    for (let i = 0; i < this.markerListeners.length; i++) {
      google.maps.event.removeListener(this.markerListeners[i]);
    }
    this.markerListeners = [];
  }

  // Remove method to remove everything.
  remove() {
    this.removeListeners();
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(null);
    }
  }

  // Remove the poppers either hover or click.
  removePopper(clicked = false) {
    let popper = document.querySelector('#popper-container');
    popper.style.display = 'none';

    if (clicked) {
      let popper_clicked = document.querySelector('#popper-container-clicked');
      popper_clicked.style.display = 'none';
    }
  }

}
