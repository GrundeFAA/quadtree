const layer = new Konva.Layer();
document.addEventListener("DOMContentLoaded", function () {
  var stage = new Konva.Stage({
    container: "container",
    width: window.innerWidth,
    height: window.innerHeight,
  });

  stage.add(layer);

  const quadTree = new QuadTree(
    new Boundary(0, 0, window.innerWidth, window.innerHeight),
    4
  );

  for (let i = 0; i < 25000; i++) {
    const x = Math.floor(Math.random() * window.innerWidth);
    const y = Math.floor(Math.random() * window.innerHeight);

    const point = new Point(x, y);

    const circle = new Konva.Circle({
      x: x,
      y: y,
      radius: 1,
      fill: "red",
    });
    layer.add(circle);

    quadTree.insert(point);
  }

  const range = new Boundary(50, 150, 75, 60);
  const rangeRect = new Konva.Rect({
    x: range.x,
    y: range.y,
    width: range.w,
    height: range.h,
    stroke: "blue",
    strokeWidth: 2,
  });
  quadTree.query(range).forEach((point) => {
    const circle = new Konva.Circle({
      x: point.x,
      y: point.y,
      radius: 1,
      fill: "blue",
    });
    layer.add(circle);
  });
  layer.add(rangeRect);
  layer.draw();
});

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Boundary {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.draw();
  }
  draw() {
    const rect = new Konva.Rect({
      x: this.x,
      y: this.y,
      width: this.w,
      height: this.h,
      stroke: "black",
      strokeWidth: 1,
    });
    layer.add(rect);
  }
  show() {
    rect(this.x, this.y, this.w, this.h);
  }
  contains(p) {
    const { x: pointX, y: pointY } = p;
    const { x, y, w, h } = this;

    const contains =
      pointX > x && pointX < x + w && pointY > y && pointY < y + h;
    return contains;
  }

  intersects(range) {
    const { x: rangeX, y: rangeY, w: rangeWidth, h: rangeHeight } = range;

    const { x, y, w, h } = this;
    // check if rectangles are intersecting
    const intersects = !(
      rangeX > x + w ||
      rangeX + rangeWidth < x ||
      rangeY > y + h ||
      rangeY + rangeHeight < y
    );

    return intersects;
  }
}

class QuadTree {
  constructor(boundary, n) {
    this.boundary = boundary;
    this.capacity = n;
    this.points = [];
    this.divided = false;
  }

  subdivide() {
    const { x, y, w, h } = this.boundary;
    const newWidth = w / 2;
    const newHeight = h / 2;
    const nw = new Boundary(x, y, newWidth, newHeight);
    const ne = new Boundary(x + newWidth, y, newWidth, newHeight);
    const sw = new Boundary(x, y + newHeight, newWidth, newHeight);
    const se = new Boundary(x + newWidth, y + newHeight, newWidth, newHeight);
    this.nw = new QuadTree(nw, this.capacity);
    this.ne = new QuadTree(ne, this.capacity);
    this.sw = new QuadTree(sw, this.capacity);
    this.se = new QuadTree(se, this.capacity);
    this.divided = true;
  }

  insert(p) {
    if (this.points.length < this.capacity) {
      this.points.push(p);
      return;
    }

    if (!this.divided) {
      this.subdivide();
    }

    if (this.nw.boundary.contains(p)) {
      this.nw.insert(p);
    }
    if (this.ne.boundary.contains(p)) {
      this.ne.insert(p);
    }
    if (this.sw.boundary.contains(p)) {
      this.sw.insert(p);
    }
    if (this.se.boundary.contains(p)) {
      this.se.insert(p);
    }
  }

  query(range, found) {
    if (!found) {
      found = [];
    }

    if (!this.boundary.intersects(range)) return found;
    found.push(this.points.filter((p) => range.contains(p)));
    this.nw?.query(range, found);
    this.ne?.query(range, found);
    this.sw?.query(range, found);
    this.se?.query(range, found);

    return found.flat();
  }
}
