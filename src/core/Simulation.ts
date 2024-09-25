import { Box, Connector, InputBox } from "./Basic";
import { Gate, availableGates, LogicGateFunction } from "./Gates";
import { dimensions } from "../config";

class PopupMenu {
  static instance: PopupMenu | null = null;
  ele: HTMLElement;
  constructor(x: number, y: number, options: string[], callback: Function) {
    if (PopupMenu.instance) PopupMenu.instance.remove();
    PopupMenu.instance = this;

    this.ele = document.createElement("div");
    this.ele.addEventListener("contextmenu", (e) => e.preventDefault());
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

  gates: Gate[];
  boxes: Box[];

  constructor(mainEle: HTMLElement, canvasEle: HTMLCanvasElement) {
    this.mainEle = mainEle;
    this.canvasEle = canvasEle;
    this.boxes = [];
    this.gates = [];

    new Connector(mainEle, canvasEle);
    this.updateDimensions();
    new ResizeObserver(() => {
      this.updateDimensions();
    }).observe(mainEle);

    this.addInput(
      4,
      50,
      this.height / 2 - dimensions.input.height / 2,
      dimensions.input.height,
      dimensions.input.width
    );
    this.addGate(
      "outputGate",
      this.width - 100,
      this.height / 2 - dimensions.output.height / 2,
      dimensions.output.height,
      dimensions.output.width,
      3,
      []
    );
    /*
    this.addOutput(
      4,
      this.width - 100,
      this.height / 2 - dimensions.output.height / 2,
      dimensions.output.height,
      dimensions.output.width
    );
    */
    mainEle.addEventListener("click", () => {
      if (PopupMenu.instance) PopupMenu.instance.remove();
    });

    const gatesList = ["INPUT", ...Object.keys(availableGates)];
    mainEle.addEventListener("contextmenu", (e) => {
      // ignore bubbled events
      if (e.target != mainEle) return;
      e.preventDefault();

      const x = e.offsetX,
        y = e.offsetY;
      new PopupMenu(x, y, gatesList, (key: string) => {
        if (key == "INPUT")
          return this.addInput(
            4,
            x,
            y,
            dimensions.input.height,
            dimensions.input.width
          );
        this.addGate(key, x, y, 100, 150, availableGates[key].in, [
          availableGates[key].logic,
        ]);
      }).render(this.mainEle);
    });
  }
  destroy() {
    Connector.destroy();
  }

  addInput(outCount: number, x: number, y: number, w: number, h: number) {
    const [gate, handler] = InputBox.createInputGate(outCount);
    this.gates.push(gate);
    const b = new InputBox(handler, x, y, h, w, this.height, this.width, gate);
    this.boxes.push(b);
    console.log(gate, handler, b)
    b.render(this.mainEle);
  }

  addOutput(inCount, x: number, y: number, w: number, h: number) {}
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
}
