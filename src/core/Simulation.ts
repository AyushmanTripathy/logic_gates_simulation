import { Box } from "./Basic";
import { InputBox, OutputBox } from "./IOBox";
import { Gate } from "./Gates";
import { dimensions } from "../config";
import { OutputHandler } from "./IOHandler";
import PopupMenu from "../PopupMenu";
import { Connector } from "./Connection";
import availableGates, {
  GateInfo,
  InputInfo,
  OutputInfo,
} from "./avaliableGates";

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

    this.addInput(
      availableGates["Inputs"]["4 BIT INPUT"],
      dimensions.input.width + 20,
      this.height / 2
    );
    this.addOutput(
      availableGates["Outputs"]["4 BIT OUTPUT"],
      this.width - (dimensions.output.width * 2 + 20),
      this.height / 2
    );
    mainEle.addEventListener("click", () => {
      if (PopupMenu.instance) PopupMenu.instance.remove();
    });

    mainEle.addEventListener("contextmenu", (e) => {
      // ignore bubbled events
      if (e.target != mainEle) return;
      e.preventDefault();
      this.createPopup(e.offsetX, e.offsetY);
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

  addInput(info: InputInfo, x: number, y: number) {
    const [gate, handler] = InputBox.createInputGate(info.count, info.handler);
    this.gates.push(gate);
    const b = new InputBox(handler, x, y, this.height, this.width, gate);
    this.boxes.push(b);
    b.render(this.mainEle);
  }

  addOutput(info: OutputInfo, x: number, y: number) {
    const [gate, handler] = OutputBox.createOutputGate(
      info.count,
      info.handler
    );
    this.gates.push(gate);
    const b = new OutputBox(handler, x, y, this.height, this.width, gate);
    this.boxes.push(b);
    b.render(this.mainEle);
    this.outputs.push([gate, handler]);
  }

  addGate(name: string, info: GateInfo, x: number, y: number): Gate {
    const gate = new Gate(name, info.in, info.logic);
    this.gates.push(gate);
    const b = new Box(x, y, info.labels, info.width, this.height, this.width, gate);
    this.boxes.push(b);
    b.render(this.mainEle);
    return gate;
  }

  createPopup(x: number, y: number) {
    new PopupMenu(x, y, Object.keys(availableGates), (category: string) => {
      new PopupMenu(
        x,
        y,
        Object.keys(availableGates[category]),
        (name: string) => {
          const info = availableGates[category][name];
          if (category == "Inputs") this.addInput(info, x, y);
          else if (category == "Outputs") this.addOutput(info, x, y);
          else this.addGate(name, info, x, y);
        }
      ).render(this.mainEle);
    }).render(this.mainEle);
  }

  cycle() {
    for (const gate of this.gates) gate.computeOutput();
    for (const [gate, handler] of this.outputs)
      handler.handleUpdate(gate.fetchAllInputs());
    Connector.reDraw();
  }
}
