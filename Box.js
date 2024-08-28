export class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

/**
 * @param {number} x
 * @param {number} min
 * @param {number} max
 * @returns {number} bound to range [min, max]
 * */
function boundToRange(x, min, max) {
  if (x < min) return min;
  if (x > max) return max;
  return x;
}

export default class Box {
  /**
   * @param {number} x
   * @param {number} y
   * @param {String} name
   * @param {number} w
   * @param {number} h
   * */
  constructor(x, y, w, h, name) {
    this.ele = document.createElement("div");

    this.setName(name);
    this.setHeight(h);
    this.setWidth(w);

    this.setX(x);
    this.setY(y);

    this.ele.classList.add("box");
  }

  setX(x) {
    if (typeof x != "number") throw TypeError();
    this.x = boundToRange(x, 0, globalThis.gridWidth - this.width);
    this.ele.style.left = this.x + "px";
  }
  setY(y) {
    if (typeof y != "number") throw TypeError();
    this.y = boundToRange(y, 0, globalThis.gridHeight - this.height);
    this.ele.style.top = this.y + "px";
  }

  setName(name) {
    this.name = name;
    this.ele.innerText = name;
  }
  setHeight(h) {
    if (typeof h != "number") throw TypeError();
    this.height = h;
    this.ele.style.height = this.height + "px";
  }
  setWidth(w) {
    if (typeof w != "number") throw TypeError();
    this.width = w;
    this.ele.style.width = this.width + "px";
  }

  render(parentElement) {
    // making the element draggable
    this.ele.draggable = true;
    this.ele.addEventListener("dragstart", this.handleDragStart(this));
    this.ele.addEventListener("dragend", this.handleDragEnd(this));
    parentElement.appendChild(this.ele);
  }

  /**
   * @param {DragEvent} e
   */
  handleDragStart(box) {
    return (e) => {
      e.target.style.opacity = 0.4;
      box.dragStartScreenX = e.screenX;
      box.dragStartScreenY = e.screenY;
    };
  }

  /**
   * @param {DragEvent} e
   * */
  handleDragEnd(box) {
    return (e) => {
      e.target.style.opacity = 1;
      box.setX(box.x + e.screenX - box.dragStartScreenX);
      box.setY(box.y + e.screenY - box.dragStartScreenY);
      box.dragStartScreenX = null;
      box.dragStartScreenY = null;
    };
  }
}
