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
        labelData: o.dataset
      });

      self.markers.push(m);

      self.oms.addMarker(m)

      setTimeout(function () {
        if (document.querySelector('#popper-container') === null) {
          let temp = document.createElement('template');
          temp.innerHTML = self.returnHoverTemplate();
          //self.map.getDiv().appendChild(temp.content);
          $(self.map.getDiv()).append(self.returnHoverTemplate())
        }

        if (document.querySelector('#popper-container-clicked') === null) {
          let temp = document.createElement('template');
          temp.innerHTML = self.returnClickTemplate();
          //self.map.getDiv().appendChild(temp.content);
          $(self.map.getDiv()).append(self.returnClickTemplate())
        }
      }, 1000)

    });

    this.setEvents(false);

    // this.setOmsEvents();

  }

  setEvents(ignoreZindex = false) {

    const self = this;

    this.markers.forEach(function(marker) {

      // MouseEnter
      let mouseOverListener = marker.addListener('mouseover', function(e) {

        let target = e.target;
        let index = $(target).index()

        self.setMouseOver(self.markers[index], e)

      });

      // MouseLeave
      let mouseOutListener = marker.addListener('mouseout', function(e) {

        let target = e.target;
        let index = $(target).index()

        self.setMouseOut(self.markers[index])

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

    marker.setOptions({
      zIndex: 100,
      labelClass: `marker-point`
    });

    this.removePopper(false)

  }

  setClickEvent(marker, e) {

    // PubSub this event - passing the element.
    PointPubSub.publish('Point.click', e);

    // Remove any clicked poppers...
    this.removePopper(true);

    if (marker.get('clickContent') === "") {
      return false;
    }

    this.showPopper(marker, e)

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

  setDocumentClick() {
    const self = this;
    document.addEventListener('click', function(e) {
      const target = e.target;
      console.log(target.className)
      if (target.className.indexOf('clicked') === -1) {
        self.removePopper(true);
      }
    });
  }

}