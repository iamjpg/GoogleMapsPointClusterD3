function importTest(name, path) {
  describe(name, function () {
    require(path);
  });
}

describe('PointCluster Testing', function() {
  importTest('PointCluster', './components/PointCluster');
});
