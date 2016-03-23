function OverlayContainer(map) {
  this.map = map;
}

OverlayContainer.prototype = new google.maps.OverlayView();
OverlayContainer.prototype.onRemove = function() {
  this.div.parentNode.removeChild(this.div);
  this.div = null;
}
OverlayContainer.prototype.onAdd = function() {
  this.div = document.createElement('div');
  this.div.id = 'point_cluster_overlay';
  var panes = this.getPanes();
  panes.overlayImage.appendChild(this.div);
}
OverlayContainer.prototype.draw = function() {
  var overlayProjection = this.getProjection();
  var sw = overlayProjection.fromLatLngToDivPixel(this.map.getBounds().getSouthWest());
  var ne = overlayProjection.fromLatLngToDivPixel(this.map.getBounds().getNorthEast());
  this.div.style.left = sw.x + 'px';
  this.div.style.top = ne.y + 'px';
}

module.exports = OverlayContainer;
