import { Gate } from "./Gates.js";

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

/** @returns {string} Random hash string */
function randomHash() {
  let s = "";
  for (let i = 0; i < 10; i++) {
    s += String.fromCharCode(33 + Math.floor(Math.random() * 90));
  }
  return s;
}

export class Connector {
  static hasInstance = false;
  /** @type {Connector}*/
  static instance;

  /**
   * @param {HTMLElement} boxContainerEle
   * @param {HTMLCanvasElement} canvasEle
   * */
  constructor(boxContainerEle, canvasEle) {
    if (Connector.hasInstance) throw "Connector instance present";
    Connector.hasInstance = true;
    const canvasCtx = canvasEle.getContext("2d");
    if (canvasCtx instanceof CanvasRenderingContext2D) this.ctx = canvasCtx;
    else throw "Canvas getContext gives null";

    this.boxContainerRect = boxContainerEle.getBoundingClientRect();
    this.connections = {};
    Connector.instance = this;
  }

  /**
   * @param {Connection} conn
   * */
  static addConnection(conn) {
    if (!this.hasInstance) throw "no Connector instance";
    if (conn.dots[0].isInput == conn.dots[1].isInput) return;

    // if is output dot and already connected with other
    /** @type {(d:Dot)=>boolean} */
    const checkOutputCondition = (d) =>
      d.isInput && !!Object.keys(d.connections).length;
    if (checkOutputCondition(conn.dots[0])) return;
    if (checkOutputCondition(conn.dots[1])) return;

    conn.dots[0].connect(conn.dots[1], conn);
    conn.dots[1].connect(conn.dots[0], conn);

    this.instance.connections[conn.hash] = conn;
    this.instance.drawConnections();
  }
  static reDraw() {
    if (!this.hasInstance) throw "no Connector instance";
    this.instance.drawConnections();
  }
  /** @param {string} connHash */
  static removeConnection(connHash) {
    if (!this.hasInstance) throw "no Connector instance";
    delete this.instance.connections[connHash];
    Connector.reDraw();
  }
  /**
   * @param {HTMLElement} ele
   * @returns {Object}
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
  /**
   * @param {Object} p
   * @param {number} p.x
   * @param {number} p.y
   * @param {string} color
   * @param {Object} q
   * @param {number} q.x
   * @param {number} q.y
   * */
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
   * */
  constructor(d1, d2) {
    if (d1.hashId == d2.hashId) throw "Cannot create same dots";
    this.hash = randomHash();
    this.dots = [d1, d2];
    this.color = d1.isInput ? d2.connectionColor : d1.connectionColor;
  }

  destroy() {
    this.dots[0].removeConnection(this.hash);
    this.dots[1].removeConnection(this.hash);
    Connector.removeConnection(this.hash);
  }
}

class Dot {
  /** @type {Dot|null} */
  static selectedDot = null;
  /**
   * @param {number} index
   * @param {boolean} isInput
   * @param {Box} parentBox
   * */
  constructor(index, isInput, parentBox) {
    this.isInput = isInput;
    this.parentBox = parentBox;
    this.ele = document.createElement("div");
    this.ele.classList.add("dot");
    this.connections = {};
    this.connectionColor = isInput ? "black" : ColorGenrator.getColor();
    this.index = index;

    this.ele.style.backgroundColor = this.connectionColor;
    this.hashId = randomHash();
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

  /**
   * @param {string} connHash
   * @returns {undefined}
   */
  removeConnection(connHash) {
    delete this.connections[connHash];
    if (this.isInput) {
      this.parentBox.gate.removeInput(this.index);
    }
    this.ele.style.backgroundColor = this.connectionColor;
  }

  removeAllConnections() {
    const connHashes = Object.keys(this.connections);
    for (const connHash of connHashes) this.connections[connHash].destroy();
    this.ele.style.backgroundColor = this.connectionColor;
  }

  /** @param {HTMLElement} parentElement */
  render(parentElement) {
    parentElement.appendChild(this.ele);
    this.ele.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      this.removeAllConnections();
    });
    this.ele.addEventListener("click", (e) => {
      e.preventDefault();

      // connecting both
      if (Dot.selectedDot && Dot.selectedDot.hashId != this.hashId) {
        const conn = new Connection(this, Dot.selectedDot);
        Connector.addConnection(conn);
        Dot.selectedDot = null;
        return;
      }

      Dot.selectedDot = this;
    });
  }
}

class DotContainer {
  /**
   * @param {Box} parentBox
   * @param {boolean} isInput
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
  /** @type {number} */
  x;
  /** @type {number} */
  y;
  /** @type {number} */
  height;
  /** @type {number} */
  width;
  /** @type {number}*/
  dragStartScreenY;
  /** @type {number}*/
  dragStartScreenX;
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
  /** @param {number} x */
  setX(x) {
    if (typeof x != "number") throw TypeError();
    this.x = boundToRange(x, 0, globalThis.gridWidth - this.width);
    this.ele.style.left = this.x + "px";
  }
  /** @param {number} y */
  setY(y) {
    if (typeof y != "number") throw TypeError();
    this.y = boundToRange(y, 0, globalThis.gridHeight - this.height);
    this.ele.style.top = this.y + "px";
  }
  /** @param {string} name */
  setName(name) {
    this.name = name;
    this.nameEle.innerText = name;
  }
  /** @param {number} h */
  setHeight(h) {
    if (typeof h != "number") throw TypeError();
    this.height = h;
    this.ele.style.height = this.height + "px";
  }
  /** @param {number} w */
  setWidth(w) {
    if (typeof w != "number") throw TypeError();
    this.width = w;
    this.ele.style.width = this.width + "px";
  }

  /** @param {HTMLElement} parentElement */
  render(parentElement) {
    // making the element draggable
    this.ele.draggable = true;
    this.ele.addEventListener("dragstart", this.handleDragStart(this));
    this.ele.addEventListener("dragend", this.handleDragEnd(this));
    parentElement.appendChild(this.ele);
  }

  /**
   * @param {Box} box
   * @returns {(e:DragEvent) => undefined}
   * */
  handleDragStart(box) {
    return (e) => {
      if (e.target instanceof HTMLElement) e.target.style.opacity = "0.4";
      box.dragStartScreenX = e.screenX;
      box.dragStartScreenY = e.screenY;
    };
  }

  /**
   * @param {Box} box
   * @returns {(e:DragEvent) => undefined}
   * */
  handleDragEnd(box) {
    return (e) => {
      if (e.target instanceof HTMLElement) e.target.style.opacity = "1";
      box.setX(box.x + e.screenX - box.dragStartScreenX);
      box.setY(box.y + e.screenY - box.dragStartScreenY);
      box.dragStartScreenX = 0;
      box.dragStartScreenY = 0;
      Connector.reDraw();
    };
  }
}
