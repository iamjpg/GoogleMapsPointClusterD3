function OverlayContainer() {}

OverlayContainer.prototype = new google.maps.OverlayView();
OverlayContainer.prototype.onRemove = function() {}
OverlayContainer.prototype.onAdd = function() {
  var div = document.createElement('div');
  div.id = 'point_cluster_overlay';
  var panes = this.getPanes();
  panes.overlayImage.appendChild(div);
}
OverlayContainer.prototype.draw = function() {}

module.exports = OverlayContainer;
