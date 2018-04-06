class Stock {
  constructor(name, picker) {
    // Two immutable properties
    Object.defineProperty(this, "name", {value: name, writable: false});
    Object.defineProperty(this, "picker", {value: picker, writable: false});

    // this gets the data object whose variable name is the inputted picker value
    this.data = eval(picker);
  }

  toString() {
    return this.name;
  }
}