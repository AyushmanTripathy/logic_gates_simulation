import { Level } from "../units";
import { delay, select } from "../utils";
import { InputIOContainer, OutputIOContainer } from "./IOContainer";
import Simulation from "./Simulation";

export default class SimulationController {
  sim: Simulation;
  inputContainer: InputIOContainer;
  outputContainer: OutputIOContainer;
  constructor(level: Level) {
    const inputIOValues = new Array(level.inCount).fill(false);
    const ele = select("#gameMain");
    const canvas = select<HTMLCanvasElement>("#gameCanvas");
    this.sim = new Simulation(inputIOValues, level.outCount, ele, canvas);

    const inputIOContainer = select("#inputIOContainer");
    this.inputContainer = new InputIOContainer(
      inputIOContainer,
      inputIOValues,
      (i: number, v: boolean) => this.sim.updateInput(i, v)
    );
    const outputIOContainer = select("#outputIOContainer");
    this.outputContainer = new OutputIOContainer(
      outputIOContainer,
      level.outCount
    );
  }
  setInput(values: boolean[]) {
    if (values.length !== this.sim.inputCount) throw "invalid values length";
    for (let i = 0; i < values.length; i++) {
      this.inputContainer.updateInput(i, values[i]);
    }
  }
  cycle() {
    this.sim.cycle();
    this.outputContainer.update(this.sim.fetchOutputs());
  }
  async test(inputs: number[][], outputs: number[][]) {
    if (inputs.length !== outputs.length) throw "invalid test";
    const beforeTest = [...this.inputContainer.inputIOValues];
    for (let i = 0; i < inputs.length; i++) {
      this.setInput(inputs[i].map(Boolean));
      this.sim.cycle();
      const outs = this.sim.fetchOutputs()
      const isEqual = outs.reduce((p, c, j) => p && c == Boolean(outputs[i][j]), true);
      if (!isEqual) return false;
      await delay(100);
    }
    this.setInput(beforeTest);
    return true;
  }
}
