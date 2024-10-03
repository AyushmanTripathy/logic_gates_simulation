import { Gate } from "./Gates";
import { colors, dimensions } from "../config";
import { randomHash } from "../utils";
import { Connection, Connections, Connector } from "./Connection";

function boundToRange(x: number, min: number, max: number): number {
  if (x < min) return min;
  if (x > max) return max;
  return x;
}

export class Dot {
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
        throw "Connection rejeted by gate " + this.parentBox.gate.name;
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
      const selected = Dot.selectedDot;
      Dot.selectedDot = null;

      // connecting both
      if (selected && selected.hashId != this.hashId) {
        if (this.isInput) Connector.addConnection(selected, this);
        else Connector.addConnection(this, selected);
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
  dots: Dot[] = [];
  ele: HTMLElement;

  constructor(
    isInput: boolean,
    dotCount: number,
    labels: string[],
    parentBox: Box
  ) {
    this.isInput = isInput;
    this.parentBox = parentBox;
    this.ele = document.createElement("div");
    this.ele.classList.add("dotContainer");
    parentBox.ele.appendChild(this.ele);

    const dotsContainer = document.createElement("section");
    const labelsContainer = document.createElement("section");

    for (let i = 0; i < dotCount; i++) {
      const d = new Dot(this.indexCounter++, this.isInput, this.parentBox);
      d.render(dotsContainer);
      this.dots.push(d);
    }

    for (const label of labels) {
      const labelEle = document.createElement("div");
      labelEle.innerText = label;
      labelsContainer.appendChild(labelEle);
    }

    if (labels.length) {
      if (isInput) {
        this.ele.appendChild(dotsContainer);
        this.ele.appendChild(labelsContainer);
      } else {
        this.ele.appendChild(labelsContainer);
        this.ele.appendChild(dotsContainer);
      }
    } else this.ele.appendChild(dotsContainer);
  }

  destroy() {
    for (const d of this.dots) d.removeAllConnections();
    this.ele.remove();
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
  inputContainer: DotContainer;
  outputContainer: DotContainer;
  nameEle: HTMLElement;

  constructor(
    x: number,
    y: number,
    labels: { in: string[] | null; out: string[] | null },
    w: number,
    sh: number,
    sw: number,
    gate: Gate
  ) {
    this.gate = gate;
    this.simulationHeight = sh;
    this.simulationWidth = sw;
    this.ele = document.createElement("div");
    this.ele.classList.add("box");

    if (gate.inCount)
      this.inputContainer = new DotContainer(
        true,
        gate.inCount,
        labels.in,
        this
      );
    else this.inputContainer = null;

    this.nameEle = document.createElement("h1");
    if (gate.inCount && gate.outCount) this.nameEle.innerText = gate.name;
    this.ele.appendChild(this.nameEle);

    if (gate.outCount)
      this.outputContainer = new DotContainer(
        false,
        gate.outCount,
        labels.out,
        this
      );
    else this.outputContainer = null;

    this.setHeight(
      dimensions.dotHeight * Math.max(gate.inCount, gate.outCount)
    );
    this.setWidth(w);
    this.setX(x);
    this.setY(y);
  }

  get element(): HTMLElement {
    return this.ele;
  }

  destroy() {
    if (this.inputContainer) this.inputContainer.destroy();
    if (this.outputContainer) this.outputContainer.destroy();
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
