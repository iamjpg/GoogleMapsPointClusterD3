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
    this.previousClickedMarker = null;
    this.oms = new OverlappingMarkerSpiderfier(this.map, {
      markersWontMove: true,
      markersWontHide: true,
      nearbyDistance: 10,
      keepSpiderfied: true,
      legWeight: 3,
      usualLegZIndex: 25000
    });
    this.setDocumentClick();
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
        hoverContent: o.hoverData || '',
        clickContent: o.clickData || '',
        labelContent: '',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 0
        },
        draggable: false,
        labelAnchor: new google.maps.Point(10, 10),
        labelClass: 'marker-point',
        labelData: o.dataset
      });

      self.markers.push(m);

      self.oms.addMarker(m)

      setTimeout(function () {
        if (document.querySelector('#popper-container') === null) {
          let temp = document.createElement('template');
          temp.innerHTML = self.returnHoverTemplate();
          $(self.map.getDiv()).append(self.returnHoverTemplate())
        }

        if (document.querySelector('#popper-container-clicked') === null) {
          let temp = document.createElement('template');
          temp.innerHTML = self.returnClickTemplate();
          $(self.map.getDiv()).append(self.returnClickTemplate())
        }
      }, 1000)

    });

    this.setEvents(false);
    this.setOmsEvents();
  }

  // Init the point spiderification.
  setOmsEvents() {
    const self = this;

    this.oms.addListener('click', function(marker, event) {
      self.removePopper();
    });

    this.oms.addListener('spiderfy', function(markers, event) {

      setTimeout(function() {
        self.removeUniversalPointHoverState();
        requestAnimationFrame(() => {
          self.removePopper(true);
        });
        self.markers.forEach(function(marker) {

          let newClass = self.returnUpdatedPinClass(marker);

          marker.setOptions({
            zIndex: 1000,
            labelClass: `${newClass} fadePins`
          });
        })
        markers.forEach(function(marker) {
          let newClass = self.returnUpdatedPinClass(marker);

          self.removeListeners();
          self.setEvents(true);
          marker.setOptions({
            zIndex: 20000,
            labelClass: newClass.replace('fadePins', '')
          });
        });
      }, 250)

    });

    this.oms.addListener('unspiderfy', function(markers, event) {
      setTimeout(function() {
        self.removeUniversalPointHoverState();
        self.removePopper();
        self.markers.forEach(function(marker) {
          marker.setOptions({
            zIndex: 1000,
            labelClass: marker.labelClass.replace(" fadePins", "")
          });
        });
        self.setEvents(false);
      }, 250)
    });
  }

  setEvents(ignoreZindex = false) {

    const self = this;

    this.markers.forEach(function(marker) {
      // MouseEnter
      let mouseOverListener = marker.addListener('mouseover', function(e) {

        let target = e.target;
        let index = $(target).index()

        self.setMouseOver(marker, e)
      });

      // MouseLeave
      let mouseOutListener = marker.addListener('mouseout', function(e) {
        let target = e.target;
        let index = $(target).index()

        self.setMouseOut(marker)
      });

      let clickListener = marker.addListener('click', function(e) {
        let target = e.target;
        let index = $(target).index()

        self.setClickEvent(self.markers[index], e)
      });

    })
  }

  setMouseOver(marker, e) {
    marker.setOptions({
      zIndex: 10000,
      labelClass: `${marker.labelClass} PointHoverState`
    });

    this.showPopper(marker, e)
  }

  setMouseOut(marker) {

    let newClass = this.returnUpdatedPinClass(marker);

    marker.setOptions({
      zIndex: 100,
      labelClass: newClass
    });

    this.removePopper(false)
  }

  setClickEvent(marker, e) {

    // PubSub this event - passing the element.
    PointPubSub.publish('Point.click', e);

    // Remove any clicked poppers...
    this.removePopper(true);

    this.removeUniversalPointHoverState();

    if (marker.get('clickContent') !== '') {
      this.showPopper(marker, e)
    }

    marker.setOptions({
      zIndex: 10000,
      labelClass: `${marker.labelClass} PointHoverStateClicked`
    })
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

  showPopper(marker, e) {

    // Pointers
    let map = this.map;

    // Get projection data
    let projection = map.getProjection();
    let topRight = projection.fromLatLngToPoint(map.getBounds().getNorthEast());
    let bottomLeft = projection.fromLatLngToPoint(map.getBounds().getSouthWest());
    let scale = Math.pow(2, map.getZoom());

    // Create point
    var point = projection.fromLatLngToPoint(
      new google.maps.LatLng(marker.internalPosition.lat(), marker.internalPosition.lng())
    );

    let elem;

    // Show the bubble
    if (e.type === 'click') {
      elem = document.querySelector('#popper-container-clicked');
      let inner = document.querySelector('.arrow_box_clicked');
      inner.innerHTML = marker.get('clickContent');
    } else {
      elem = document.querySelector('#popper-container');
      let inner = document.querySelector('.arrow_box');
      inner.innerHTML = marker.get('hoverContent');
    }

    elem.style.display = 'block';

    // Get the x/y based on the scale.
    let containerHeight = elem.offsetHeight;
    let containerWidth = elem.offsetWidth;
    var posLeft = parseInt(((point.x - bottomLeft.x) * scale) - (containerWidth / 2 + 4));
    var posTop = parseInt(((point.y - topRight.y) * scale) - (20 + containerHeight));

    elem.style.top = `${posTop}px`;
    elem.style.left = `${posLeft}px`;
  }

  // Remove the poppers either hover or click.
  removePopper(clicked = false) {
    let popper = document.querySelector('#popper-container');

    if (popper === null) {
      return false;
    }

    popper.style.display = 'none';

    if (clicked) {
      let popper_clicked = document.querySelector('#popper-container-clicked');
      popper_clicked.style.display = 'none';
    }
  }

  // A universal point method for removing the hoverstate of all pins.
  removeUniversalPointHoverState() {
    this.markers.forEach((o, i) => {

      let newClass = this.returnUpdatedPinClass(o);

      o.setOptions({
        zIndex: 100,
        labelClass: newClass.replace(/PointHoverStateClicked/g, '')
      });
    })
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

  setDocumentClick() {
    const self = this;
    document.addEventListener('click', function(e) {
      if (e.target.className.indexOf('clicked') === -1) {
        self.removePopper(true);
        self.removeUniversalPointHoverState();
      }
    });
  }

  returnUpdatedPinClass(marker) {
    let currentClass = marker.get('labelClass').split(' ');

    let index = currentClass.indexOf('PointHoverState');

    if (index > -1) {
      currentClass.splice(index, 1);
    }

    return currentClass.join(' ')
  }

}
