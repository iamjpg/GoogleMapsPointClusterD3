import { About } from '../../src/components/About'

var assert = require('assert');
describe('#message()', function () {
  it('should return correct message', function () {
    var about = new About();
    assert.equal(about.message(), 'This is just an example of another page!');
  });
});