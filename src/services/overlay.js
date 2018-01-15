// Constructor.
function OverlayContainer(map) {
  this.map = map;
}

// Per Google spec, ne OverlayView on the prototype.
OverlayContainer.prototype = new google.maps.OverlayView();

// Api called when setMap(null) is called
OverlayContainer.prototype.onRemove = function() {
  this.div.parentNode.removeChild(this.div);
  this.div = null;
}

// Api called when obj.setMap(map instance) is called.
OverlayContainer.prototype.onAdd = function() {
  this.div = document.createElement('div');
  this.div.id = 'point_cluster_overlay';
  var panes = this.getPanes();
  panes.overlayImage.appendChild(this.div);
}

// Api called when element is appended. Logic assures that the overlay will always be at 0/0 if the map.
OverlayContainer.prototype.draw = function() {
  var overlayProjection = this.getProjection();
  var sw = overlayProjection.fromLatLngToDivPixel(this.map.getBounds().getSouthWest());
  var ne = overlayProjection.fromLatLngToDivPixel(this.map.getBounds().getNorthEast());
  this.div.style.left = sw.x + 'px';
  this.div.style.top = ne.y + 'px';
}

module.exports = OverlayContainer;
