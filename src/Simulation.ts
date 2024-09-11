import { Box, Connector } from "./Basic.js";
import { Gate, LogicGateFunction, availableGates } from "./Gates.js";
import { dimensions } from "./config.js";

const fixedBuffer = (a: boolean[], i: number) => {
  return () => a[i];
};

class PopupMenu {
  static instance: PopupMenu | null = null;
  ele: HTMLElement;
  constructor(x: number, y: number, options: string[], callback: Function) {
    if (PopupMenu.instance) PopupMenu.instance.remove();
    PopupMenu.instance = this;

    this.ele = document.createElement("div");
    this.ele.classList.add("popup");
    for (const opt of options) {
      const p = document.createElement("p");
      p.innerText = opt;
      p.onclick = () => {
        this.remove();
        callback(opt);
      };
      this.ele.appendChild(p);
      this.ele.style.top = y + "px";
      this.ele.style.left = x + "px";
    }
  }
  remove() {
    PopupMenu.instance = null;
    this.ele.remove();
  }
  render(parentEle: HTMLElement) {
    parentEle.appendChild(this.ele);
  }
}

export default class Simulation {
  mainEle: HTMLElement;
  canvasEle: HTMLCanvasElement;
  height: number;
  width: number;

  inputValues: boolean[];
  inputCount: number;
  outputCount: number;
  outputBufferGate: Gate;
  gates: Gate[];
  boxes: Box[];

  constructor(
    inputValuesArr: boolean[],
    outputCount: number,
    mainEle: HTMLElement,
    canvasEle: HTMLCanvasElement
  ) {
    this.mainEle = mainEle;
    this.canvasEle = canvasEle;
    this.boxes = [];
    this.gates = [];

    new Connector(mainEle, canvasEle);
    this.updateDimensions();
    new ResizeObserver(() => {
      this.updateDimensions();
    }).observe(mainEle);

    this.inputValues = [...inputValuesArr];
    this.inputCount = inputValuesArr.length;
    this.outputCount = outputCount;

    let inputBufferFuncs = [];
    for (let i = 0; i < this.inputCount; i++) {
      inputBufferFuncs.push(fixedBuffer(this.inputValues, i));
    }

    this.addGate(
      "INPUT",
      0,
      this.height / 2 - dimensions.input.height / 2,
      dimensions.input.height,
      dimensions.input.width,
      0,
      inputBufferFuncs
    );
    this.outputBufferGate = this.addGate(
      "OUTPUT",
      this.width,
      this.height / 2 - dimensions.output.height / 2,
      dimensions.output.height,
      dimensions.output.width,
      outputCount,
      []
    );

    mainEle.addEventListener("contextmenu", (e) => {
      // ignore bubbled events
      if (e.target != mainEle) return;
      e.preventDefault();

      const x = e.offsetX,
        y = e.offsetY;
      new PopupMenu(x, y, Object.keys(availableGates), (key: string) => {
        this.addGate(key, x, y, 100, 150, availableGates[key].in, [
          availableGates[key].logic,
        ]);
      }).render(this.mainEle);
    });
  }
  destroy() {
    Connector.destroy();
  }

  updateDimensions() {
    this.height = this.mainEle.clientHeight;
    this.width = this.mainEle.clientWidth;

    for (let i = 0; i < this.boxes.length; i++)
      this.boxes[i].updateDimensions(this.height, this.width);

    this.canvasEle.height = this.height;
    this.canvasEle.width = this.width;

    Connector.reDraw();
  }

  addGate(
    name: string,
    x: number,
    y: number,
    w: number,
    h: number,
    inCount: number,
    outLogicFuncs: LogicGateFunction[]
  ): Gate {
    const gate = new Gate(name, inCount, outLogicFuncs);
    this.gates.push(gate);
    const b = new Box(x, y, h, w, this.height, this.width, gate);
    this.boxes.push(b);
    b.render(this.mainEle);
    return gate;
  }
  cycle() {
    for (const gate of this.gates) gate.computeOutput();
    Connector.reDraw();
  }
  updateInput(index: number, value: boolean) {
    if (index < 0 || this.inputCount <= index)
      throw "cannot update index " + index;
    if (typeof value != "boolean") throw "cannot update to value " + value;
    this.inputValues[index] = value;
  }
  fetchOutputs(): boolean[] {
    return this.outputBufferGate.fetchAllInputs();
  }
}
