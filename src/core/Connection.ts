import { colors } from "../config";
import { randomHash } from "../utils";
import { Dot } from "./Basic";

export interface Connections {
  [key: string]: Connection;
}

interface Point {
  x: number;
  y: number;
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
    if (from.isInput) throw "cannot connect input to input.";
    if (!to.isInput) throw "cannot connect output to output";

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

export class Connection {
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
