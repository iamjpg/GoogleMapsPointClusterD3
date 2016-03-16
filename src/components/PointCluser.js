export class PointCluster {

  constructor(options) {
    if (!options.map) { return console.error('ERROR: Google map instance is a requirement.'); }
    this.map = options.map;
    this.threshold = options.threshold || 200;
  }

  setCollection(collection) {
    if (!collection) { return console.error('Please pass an array of location objects.'); }
    this.collection = collection;
  }

}
