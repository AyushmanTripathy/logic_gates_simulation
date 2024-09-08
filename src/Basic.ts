import { Gate } from "./Gates.js";

interface Point {
  x: number;
  y: number;
}

interface Connections {
  [key: string]: Connection;
}

const colors = {
  dotNotConnected: "black",
  dotConnectedLow: "grey",
  dotConnectedHigh: "red",
};

function boundToRange(x: number, min: number, max: number): number {
  if (x < min) return min;
  if (x > max) return max;
  return x;
}

function randomHash(): string {
  let s = "";
  for (let i = 0; i < 10; i++) {
    s += String.fromCharCode(33 + Math.floor(Math.random() * 90));
  }
  return s;
}

export class Connector {
  static hasInstance = false;
  static instance: Connector;

  boxContainerRect: DOMRect;
  connections: Connections;
  ctx: CanvasRenderingContext2D;
  constructor(boxContainerEle: HTMLElement, canvasEle: HTMLCanvasElement) {
    if (Connector.hasInstance) throw "Connector instance present";
    Connector.hasInstance = true;
    const canvasCtx = canvasEle.getContext("2d");
    if (canvasCtx instanceof CanvasRenderingContext2D) this.ctx = canvasCtx;
    else throw "Canvas getContext gives null";

    this.boxContainerRect = boxContainerEle.getBoundingClientRect();
    this.connections = {};
    Connector.instance = this;
  }

  static addConnection(conn: Connection) {
    if (!this.hasInstance) throw "no Connector instance";

    // if is input dot and already connected with other
    if (Object.keys(conn.to.connections).length) {
      conn.destroy();
      throw "input dot already connected";
    }

    conn.from.connect(conn.to, conn);
    conn.to.connect(conn.from, conn);

    this.instance.connections[conn.hash] = conn;
    this.instance.drawConnections();
  }
  static reDraw() {
    if (!this.hasInstance) throw "no Connector instance";
    this.instance.drawConnections();
  }
  static removeConnection(connHash: string) {
    if (!this.hasInstance) throw "no Connector instance";
    delete this.instance.connections[connHash];
    Connector.reDraw();
  }
  getPos(ele: HTMLElement): Point {
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
      const p = this.getPos(conn.from.ele);
      const q = this.getPos(conn.to.ele);
      this.drawConnectionLine(p, q, conn.isHigh);
    }
  }
  drawConnectionLine(p: Point, q: Point, isHigh: boolean) {
    this.ctx.strokeStyle = isHigh
      ? colors.dotConnectedHigh
      : colors.dotConnectedLow;
    this.ctx.lineWidth = 5;
    this.ctx.beginPath();
    this.ctx.moveTo(p.x, p.y);
    this.ctx.lineTo(q.x, q.y);
    this.ctx.stroke();
  }
}

class Connection {
  hash: string;
  from: Dot;
  to: Dot;
  isHigh: boolean;

  constructor(from: Dot, to: Dot) {
    if (from.hashId == to.hashId) throw "Cannot create same dots";
    this.hash = randomHash();
    if (from.isInput) throw "from cannot be input dot";
    else this.from = from;
    if (to.isInput) this.to = to;
    else throw "to cannot be output dot";
    this.isHigh = false;

    from.parentBox.gate.setOutputCallback(
      from.index,
      this.hash,
      (level: boolean) => this.setLevel(level)
    );
  }

  setLevel(isHigh: boolean) {
    this.isHigh = isHigh;
    this.from.setLevel(isHigh);
    this.to.setLevel(isHigh);
  }

  destroy() {
    this.from.removeConnection(this.hash);
    this.from.parentBox.gate.removeOutputCallback(this.from.index, this.hash);
    this.to.removeConnection(this.hash);
    Connector.removeConnection(this.hash);
  }
}

class Dot {
  static selectedDot: Dot | null = null;
  isInput: boolean;
  parentBox: Box;
  ele: HTMLElement;
  connections: Connections;
  index: number;
  hashId: string;

  constructor(index: number, isInput: boolean, parentBox: Box) {
    this.isInput = isInput;
    this.parentBox = parentBox;
    this.ele = document.createElement("div");
    this.ele.classList.add("dot");
    this.connections = {};
    this.index = index;

    this.ele.style.backgroundColor = colors.dotNotConnected;
    this.hashId = randomHash();
  }

  connect(d: Dot, conn: Connection) {
    this.ele.style.backgroundColor = colors.dotConnectedLow;
    if (this.isInput) {
      if (!this.parentBox.gate.setInput(this.index, d.parentBox.gate, d.index))
        console.log("Connection rejeted by gate");
    }
    this.connections[conn.hash] = conn;
  }

  removeConnection(connHash: string) {
    delete this.connections[connHash];
    if (this.isInput) {
      this.parentBox.gate.removeInput(this.index);
    }
    this.ele.style.backgroundColor = colors.dotNotConnected;
  }

  removeAllConnections() {
    const connHashes = Object.keys(this.connections);
    for (const connHash of connHashes) this.connections[connHash].destroy();
    this.ele.style.backgroundColor = colors.dotNotConnected;
  }

  render(parentElement: HTMLElement) {
    parentElement.appendChild(this.ele);
    this.ele.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      this.removeAllConnections();
    });
    this.ele.addEventListener("click", (e) => {
      e.preventDefault();

      // connecting both
      if (Dot.selectedDot && Dot.selectedDot.hashId != this.hashId) {
        let conn: Connection;
        if (this.isInput) conn = new Connection(Dot.selectedDot, this);
        else conn = new Connection(this, Dot.selectedDot);
        Connector.addConnection(conn);
        Dot.selectedDot = null;
        return;
      }

      Dot.selectedDot = this;
    });
  }

  setLevel(isHigh: boolean) {
    this.ele.style.backgroundColor = isHigh
      ? colors.dotConnectedHigh
      : colors.dotConnectedLow;
  }
}

class DotContainer {
  isInput: boolean;
  indexCounter = 0;
  parentBox: Box;
  ele: HTMLElement;

  constructor(isInput: boolean, parentBox: Box) {
    this.isInput = isInput;
    this.parentBox = parentBox;
    this.ele = document.createElement("div");
    this.ele.classList.add("dotContainer");
    parentBox.ele.appendChild(this.ele);
  }

  addDot(): Dot {
    const d = new Dot(this.indexCounter++, this.isInput, this.parentBox);
    d.render(this.ele);
    return d;
  }
}
export class Box {
  x: number;
  y: number;
  height: number;
  width: number;
  dragStartScreenY: number | null;
  dragStartScreenX: number | null;

  ele: HTMLElement;
  gate: Gate;
  dots: Dot[];
  inputContainer: DotContainer;
  outputContainer: DotContainer;
  nameEle: HTMLElement;

  constructor(x: number, y: number, w: number, h: number, gate: Gate) {
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

  setX(x: number) {
    if (typeof x != "number") throw TypeError();
    this.x = boundToRange(x, 0, globalThis.gridWidth - this.width);
    this.ele.style.left = this.x + "px";
  }
  setY(y: number) {
    if (typeof y != "number") throw TypeError();
    this.y = boundToRange(y, 0, globalThis.gridHeight - this.height);
    this.ele.style.top = this.y + "px";
  }
  setName(name: string) {
    this.nameEle.innerText = name;
  }
  setHeight(h: number) {
    if (typeof h != "number") throw TypeError();
    this.height = h;
    this.ele.style.height = this.height + "px";
  }
  setWidth(w: number) {
    if (typeof w != "number") throw TypeError();
    this.width = w;
    this.ele.style.width = this.width + "px";
  }

  render(parentElement: HTMLElement) {
    // making the element draggable
    this.ele.draggable = true;
    this.ele.addEventListener("dragstart", this.handleDragStart(this));
    this.ele.addEventListener("dragend", this.handleDragEnd(this));
    parentElement.appendChild(this.ele);
  }

  handleDragStart(box: Box) {
    return (e: DragEvent) => {
      if (e.target instanceof HTMLElement) e.target.style.opacity = "0.4";
      box.dragStartScreenX = e.screenX;
      box.dragStartScreenY = e.screenY;
    };
  }

  handleDragEnd(box: Box) {
    return (e: DragEvent) => {
      if (e.target instanceof HTMLElement) e.target.style.opacity = "1";
      box.setX(box.x + e.screenX - box.dragStartScreenX);
      box.setY(box.y + e.screenY - box.dragStartScreenY);
      box.dragStartScreenX = null;
      box.dragStartScreenY = null;
      Connector.reDraw();
    };
  }
}
