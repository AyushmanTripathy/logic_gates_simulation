export class ColorGenrator {
  static colors = ["aqua", "lime", "purple", "fuchsia", "teal"];
  static colorIndex = 0;
  static getColor() {
    ColorGenrator.colorIndex = (ColorGenrator.colorIndex + 1) % ColorGenrator.colors.length;
    return ColorGenrator.colors[ColorGenrator.colorIndex];
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

export class Connector {
  static hasInstance = false;
  static instance;

  /**
   * @param {HTMLElement} boxContainerEle
   * @param {HTMLCanvasElement} canvasEle
   * */
  constructor(boxContainerEle, canvasEle) {
    if (this.hasInstance) throw "Connector instance present";
    Connector.hasInstance = true;
    this.ctx = canvasEle.getContext("2d");
    this.boxContainerRect = boxContainerEle.getBoundingClientRect();
    this.connections = [];
    Connector.instance = this;
  }

  /**
   * @param {HTMLElement} d1
   * @param {HTMLElement} d2
   * */
  static addConnection(d1, d2, color) {
    if (!this.hasInstance) throw "no Connector instance";
    this.instance.connections.push([d1, d2, color]);
    this.instance.drawConnections();
  }
  static reDraw() {
    if (!this.hasInstance) throw "no Connector instance";
    this.instance.drawConnections();
  }
  /**
   * @param {HTMLElement} ele 
   * */
  getPos(ele) {
    const rect = ele.getBoundingClientRect();
    return {
      x: rect.left - this.boxContainerRect.left + (rect.width / 2),
      y: rect.top - this.boxContainerRect.top + (rect.height / 2)
    }
  }
  drawConnections() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    for (const conn of this.connections) {
      this.drawConnectionLine(this.getPos(conn[0]), this.getPos(conn[1]), conn[2]);
    }
  }
  drawConnectionLine(p, q, color) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 5;
    this.ctx.beginPath();
    this.ctx.moveTo(p.x, p.y);
    this.ctx.lineTo(q.x, q.y);
    this.ctx.stroke();
  }
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
    this.connectTo = null;
    this.connectionColor = null;
  }

  /**
   * @param {Dot} d
   * */
  connect(d) {
    /**
     * @type {CanvasRenderingContext2D}
     * */
    this.connectionColor = d.connectionColor;
    this.connectTo = d;
    this.ele.style.backgroundColor = this.connectionColor;
  }

  render(parentElement) {
    parentElement.appendChild(this.ele);
    this.ele.addEventListener("click", (e) => {
      e.preventDefault();

      // connecting both
      if (Dot.selectedDot) {
        this.connect(Dot.selectedDot);
        Connector.addConnection(Dot.selectedDot.ele, this.ele, this.connectionColor);
        Dot.selectedDot = false;
        return;
      }

      this.connectionColor = ColorGenrator.getColor();
      this.ele.style.backgroundColor = this.connectionColor;

      Dot.selectedDot = this;
    });
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
export class Box {
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
      Connector.reDraw();
    };
  }
}
