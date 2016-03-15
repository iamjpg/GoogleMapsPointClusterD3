function importTest(name, path) {
  describe(name, function () {
    require(path);
  });
}

describe('Component Testing', function() {
  importTest('About', './components/About');
});