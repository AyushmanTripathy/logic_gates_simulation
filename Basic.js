import { Gate, logicFuncs } from "./Gates.js";

export class ColorGenrator {
  static colors = ["aqua", "lime", "purple", "fuchsia", "teal"];
  static colorIndex = 0;
  static getColor() {
    ColorGenrator.colorIndex =
      (ColorGenrator.colorIndex + 1) % ColorGenrator.colors.length;
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

function randomHash() {
  let s = "";
  for (let i = 0; i < 10; i++) {
    s += String.fromCharCode(33 + Math.floor(Math.random() * 90));
  }
  return s;
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
    this.connections = {};
    Connector.instance = this;
  }

  /**
   * @param {Connection} conn
   * */
  static addConnection(conn) {
    if (!this.hasInstance) throw "no Connector instance";

    conn.dots[0].connect(conn.dots[1], conn);
    conn.dots[1].connect(conn.dots[0], conn);

    this.instance.connections[conn.hash] = conn;
    this.instance.drawConnections();
  }
  static reDraw() {
    if (!this.hasInstance) throw "no Connector instance";
    this.instance.drawConnections();
  }
  static removeConnection(connHash) {
    if (!this.hasInstance) throw "no Connector instance";
    delete this.instance.connections[connHash];
    Connector.reDraw();
  }
  /**
   * @param {HTMLElement} ele
   * */
  getPos(ele) {
    const rect = ele.getBoundingClientRect();
    return {
      x: rect.left - this.boxContainerRect.left + rect.width / 2,
      y: rect.top - this.boxContainerRect.top + rect.height / 2,
    };
  }
  drawConnections() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    for (const connHash in this.connections) {
      const conn = this.connections[connHash];
      const p = this.getPos(conn.dots[0].ele);
      const q = this.getPos(conn.dots[1].ele);
      this.drawConnectionLine(p, q, conn.color);
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

class Connection {
  /**
   * @param {Dot} d1
   * @param {Dot} d2
   * @param {String} color
   * */
  constructor(d1, d2) {
    this.hash = randomHash();
    this.dots = [d1, d2];
    this.color = d1.isInput ? d2.connectionColor: d1.connectionColor;
  }

  destroy() {
    this.dots[0].removeConnection(this.hash);
    this.dots[1].removeConnection(this.hash);
    Connector.removeConnection(this.hash);
  }
}

class Dot {
  static selectedDot = false;
  /**
   * @param {number} index
   * @param {boolean} alignLeft
   * @param {Box} parentBox
   * */
  constructor(index, isInput, parentBox) {
    this.isInput = isInput;
    this.parentBox = parentBox;
    this.ele = document.createElement("div");
    this.ele.classList.add("dot");
    this.connections = {};
    this.connectionColor = isInput ? "white" : ColorGenrator.getColor();
    this.index = index;

    this.ele.style.backgroundColor = this.connectionColor;
  }

  /**
   * @param {Dot} d
   * @param {Connection} conn
   * called by Connector.addConnection
   * */
  connect(d, conn) {
    if (this.isInput) {
      this.ele.style.backgroundColor = d.connectionColor;
      this.parentBox.gate.setInput(this.index, d.parentBox.gate, d.index);
    }
    this.connections[conn.hash] = conn;
  }

  removeConnection(connHash) {
    delete this.connections[connHash];
    this.ele.style.backgroundColor = this.connectionColor;
  }

  removeAllConnections() {
    const connHashes = Object.keys(this.connections);
    for (const connHash of connHashes) this.connections[connHash].destroy();
    this.ele.style.backgroundColor = this.connectionColor;
  }

  render(parentElement) {
    parentElement.appendChild(this.ele);
    this.ele.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      this.removeAllConnections();
    });
    this.ele.addEventListener("click", (e) => {
      e.preventDefault();

      // connecting both
      if (Dot.selectedDot) {
        if (Dot.selectedDot.isInput != this.isInput) {
          const conn = new Connection(
            this,
            Dot.selectedDot
          );
          Connector.addConnection(conn);
        }
        Dot.selectedDot = false;
        return;
      }

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
    this.indexCounter = 0;
    this.parentBox = parentBox;
    this.ele = document.createElement("div");
    this.ele.classList.add("dotContainer");
    parentBox.ele.appendChild(this.ele);
  }

  /**
   * @returns {Dot} Dot just added
   * */
  addDot() {
    const d = new Dot(this.indexCounter++, this.isInput, this.parentBox);
    d.render(this.ele);
    return d;
  }
}
export class Box {
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   * @param {Gate} gate
   * */
  constructor(x, y, w, h, gate) {
    this.gate = gate;

    this.ele = document.createElement("div");
    this.ele.classList.add("box");

    this.dots = [];
    if (gate.inCount) {
      this.inputContainer = new DotContainer(true, this);
      for (let i = 0; i < gate.inCount; i++)
        this.dots.push(this.inputContainer.addDot());
    } else this.inputContainer = null;

    this.nameEle = document.createElement("h1");
    this.ele.appendChild(this.nameEle);

    if (gate.outCount) {
      this.outputContainer = new DotContainer(false, this);
      for (let i = 0; i < gate.outCount; i++)
        this.dots.push(this.outputContainer.addDot());
    } else this.outputContainer = null;

    this.setHeight(h);
    this.setWidth(w);

    this.setX(x);
    this.setY(y);
    if (gate.inCount && gate.outCount) this.setName(gate.name);
    else this.setName("");
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
