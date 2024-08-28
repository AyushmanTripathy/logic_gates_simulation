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

class Dot {
  static selectedDot = false;
  /**
   * @param {boolean} alignLeft 
   * @param {Box} parentBox 
   * */
  constructor(isInput, parentBox) {
    this.isInput = isInput;
    this.parentBox = parentBox;
    this.ele = document.createElement("div");
    this.ele.classList.add("dot");
  }

  /**
   * @param {Dot} d 
   * */
  connect(d) {
    /**
     * @type {CanvasRenderingContext2D}
     * */
    const ctx = globalThis.canvasCtx;
    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(10, 20);
    ctx.lineTo(100, 200);
    ctx.stroke();
  }

  render(parentElement) {
    parentElement.appendChild(this.ele);
    this.ele.addEventListener("click", (e) => {
      e.preventDefault();
      if (Dot.selectedDot) {
        this.connect(Dot.selectedDot);
        Dot.selectedDot = false;
        return;
      } 
      Dot.selectedDot = this;
    })
  }
}

class DotContainer {
  /**
   * @param {Box} parentBox 
   * @param {boolean} alignLeft 
   * */
  constructor(isInput, parentBox) {
    this.isInput = isInput;
    this.parentBox = parentBox;
    this.ele = document.createElement("div");
    this.ele.classList.add("dotContainer");
    parentBox.ele.appendChild(this.ele);
  }

  addDot() {
    const d = new Dot(this.isInput, this.parentBox);
    d.render(this.ele);
    return d;
  }
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
    this.ele.classList.add("box");

    this.inputContainer = new DotContainer(true, this);
    this.nameEle = document.createElement("h1");
    this.ele.appendChild(this.nameEle);
    this.outputContainer = new DotContainer(false, this);

    this.inputContainer.addDot();
    this.inputContainer.addDot();
    this.outputContainer.addDot();

    this.setHeight(h);
    this.setWidth(w);

    this.setX(x);
    this.setY(y);
    this.setName(name);
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
    this.nameEle.innerText = name;
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

  handleDragStart(box) {
    return (e) => {
      e.target.style.opacity = 0.4;
      box.dragStartScreenX = e.screenX;
      box.dragStartScreenY = e.screenY;
    };
  }

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
