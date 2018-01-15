var pc = new PointCluster({
  map: window.map
});

pc.setCollection([
  // SF
  {
    "lat": 37.937238,
    "lng": -121.719173
  },
  // DC
  {
    "lat": 38.900497,
    "lng": -77.007507
  }
])


describe('#setCollection()', function () {
  it('should be an array of lat/lng objects', function () {
    chai.assert.isTrue(_.isArray(pc.collection), 'is an array of objects.');
  });
});

describe('#createOverlay()', function () {
  it('overlay should be an object', function () {
    pc.createOverlay()
    chai.assert.isObject(pc.overlay, 'is an object');
  });
});

describe('#checkIfLatLngInBounds()', function () {
  it('should have two lat lngs but only return one.', function () {
    var arr = pc.checkIfLatLngInBounds()
    chai.assert.strictEqual(arr.length, 1, 'Two points; only one in bounds - so one returned.');
  });
})
