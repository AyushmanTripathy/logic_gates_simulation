import { Box } from "./Basic";
import { InputBox, OutputBox } from "./IOBox";
import { Gate, availableGates, LogicGateFunction } from "./Gates";
import { dimensions } from "../config";
import { OutputHandler } from "./IOHandler";
import PopupMenu from "../PopupMenu";
import { Connector } from "./Connection";

export default class Simulation {
  mainEle: HTMLElement;
  canvasEle: HTMLCanvasElement;
  height: number;
  width: number;

  gates: Gate[] = [];
  boxes: Box[] = [];
  outputs: [Gate, OutputHandler][] = [];

  constructor(mainEle: HTMLElement, canvasEle: HTMLCanvasElement) {
    this.mainEle = mainEle;
    this.canvasEle = canvasEle;

    new Connector(mainEle, canvasEle);
    this.updateDimensions();
    new ResizeObserver(() => {
      this.updateDimensions();
    }).observe(mainEle);

    this.addInput(4, 50, this.height / 2 - dimensions.input.height / 2);
    this.addOutput(
      4,
      this.width - 100,
      this.height / 2 - dimensions.output.height / 2
    );
    mainEle.addEventListener("click", () => {
      if (PopupMenu.instance) PopupMenu.instance.remove();
    });

    const gatesList = ["INPUT", "OUTPUT", ...Object.keys(availableGates)];
    mainEle.addEventListener("contextmenu", (e) => {
      // ignore bubbled events
      if (e.target != mainEle) return;
      e.preventDefault();

      const x = e.offsetX,
        y = e.offsetY;
      new PopupMenu(x, y, gatesList, (key: string) => {
        if (key == "INPUT") return this.addInput(4, x, y);
        if (key == "OUTPUT") return this.addOutput(4, x, y);

        this.addGate(key, x, y, 100, 150, availableGates[key].in, [
          availableGates[key].logic,
        ]);
      }).render(this.mainEle);
    });
  }

  destroy() {
    Connector.destroy();
  }

  addInput(outCount: number, x: number, y: number) {
    const [gate, handler] = InputBox.createInputGate(outCount);
    this.gates.push(gate);
    const b = new InputBox(handler, x, y, this.height, this.width, gate);
    this.boxes.push(b);
    b.render(this.mainEle);
  }

  addOutput(inCount: number, x: number, y: number) {
    const [gate, handler] = OutputBox.createOutputGate(inCount);
    this.gates.push(gate);
    const b = new OutputBox(handler, x, y, this.height, this.width, gate);
    this.boxes.push(b);
    b.render(this.mainEle);
    this.outputs.push([gate, handler]);
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
    for (const [gate, handler] of this.outputs)
      handler.handleUpdate(gate.fetchAllInputs());
    Connector.reDraw();
  }
}
