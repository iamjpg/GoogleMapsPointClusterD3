var _ = require('underscore');
var chai = require('chai');
import { PointCluster } from '../../src/components/PointCluster'

describe('#setCollection()', function () {
  it('should be an array of lat/lng objects', function () {
    var pc = new PointCluster({
      map: ''
    });
    pc.setCollection([
      {
        "lat": 37.937238,
        "lng": -121.719173
      }
    ])
    chai.assert.isTrue(_.isArray(pc.collection), 'is an array of objects.');
  });
});
