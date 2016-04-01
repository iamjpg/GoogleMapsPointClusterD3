export class Helpers {
  constructor() {

  }

  returnClusterClassObject(length) {
    var classSize,
        offset;
    if (length >= 3) {
      classSize = 'large';
      offset = 25;
    } else if (length == 2) {
      classSize = 'medium';
      offset = 20;
    } else {
      classSize = 'small';
      offset = 15;
    }

    return {
      classSize: classSize,
      offSet: offset
    }

  }
}
