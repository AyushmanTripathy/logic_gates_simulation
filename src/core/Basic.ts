import { Gate } from "./Gates";
import { colors } from "../config";

interface Point {
  x: number;
  y: number;
}

interface Connections {
  [key: string]: Connection;
}

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

  boxContainerEle: HTMLElement;
  boxContainerRect: DOMRect | null = null;
  connections: Connections;
  ctx: CanvasRenderingContext2D;

  constructor(boxContainerEle: HTMLElement, canvasEle: HTMLCanvasElement) {
    if (Connector.hasInstance) throw "Connector instance present";
    Connector.hasInstance = true;
    const canvasCtx = canvasEle.getContext("2d");
    if (canvasCtx instanceof CanvasRenderingContext2D) this.ctx = canvasCtx;
    else throw "Canvas getContext gives null";

    this.boxContainerEle = boxContainerEle;
    this.connections = {};
    Connector.instance = this;
  }

  static destroy() {
    Connector.hasInstance = false;
  }

  static addConnection(from: Dot, to: Dot): Connection {
    if (!this.hasInstance) throw "no Connector instance";

    if (from.hashId == to.hashId) throw "Cannot create same dots";
    if (from.isInput) throw "from cannot be input dot";
    if (!to.isInput) throw "to cannot be output dot";

    // if is input dot and already connected with other
    if (Object.keys(to.connections).length) to.removeAllConnections();

    const conn = new Connection(from, to);
    from.connect(to, conn);
    to.connect(from, conn);

    this.instance.connections[conn.hash] = conn;
    this.instance.drawConnections();

    return conn;
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
    this.boxContainerRect = this.boxContainerEle.getBoundingClientRect();
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
    this.from = from;
    this.isHigh = false;
    this.to = to;
    this.hash = randomHash();

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
      e.stopPropagation();
      this.removeAllConnections();
    });
    this.ele.addEventListener("click", (e) => {
      e.preventDefault();

      // connecting both
      if (Dot.selectedDot && Dot.selectedDot.hashId != this.hashId) {
        if (this.isInput) Connector.addConnection(Dot.selectedDot, this);
        else Connector.addConnection(this, Dot.selectedDot);
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
  simulationHeight: number;
  simulationWidth: number;

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

  constructor(
    x: number,
    y: number,
    w: number,
    h: number,
    sh: number,
    sw: number,
    gate: Gate
  ) {
    this.gate = gate;

    this.simulationHeight = sh;
    this.simulationWidth = sw;
    this.ele = document.createElement("div");
    this.ele.classList.add("box");

    this.dots = [];
    if (gate.inCount) {
      this.inputContainer = new DotContainer(true, this);
      for (let i = 0; i < gate.inCount; i++)
        this.dots.push(this.inputContainer.addDot());
    } else this.inputContainer = null;

    this.nameEle = document.createElement("h1");
    if (gate.inCount && gate.outCount) this.nameEle.innerText = gate.name;
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
  }

  destroy() {
    for (const d of this.dots) {
      d.removeAllConnections();
    }
    this.ele.remove();
  }

  updateDimensions(h: number, w: number) {
    this.simulationWidth = w;
    this.simulationHeight = h;
    this.setX(this.x);
    this.setY(this.y);
  }

  setX(x: number) {
    this.x = boundToRange(x, 0, this.simulationWidth - this.width);
    this.ele.style.left = this.x + "px";
  }
  setY(y: number) {
    this.y = boundToRange(y, 0, this.simulationHeight - this.height);
    this.ele.style.top = this.y + "px";
  }
  setHeight(h: number) {
    this.height = h;
    this.ele.style.height = this.height + "px";
  }
  setWidth(w: number) {
    this.width = w;
    this.ele.style.width = this.width + "px";
  }

  render(parentElement: HTMLElement) {
    // making the element draggable
    this.ele.draggable = true;
    this.ele.addEventListener("dragstart", this.handleDragStart(this));
    this.ele.addEventListener("dragend", this.handleDragEnd(this));
    this.ele.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.destroy();
    });
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
