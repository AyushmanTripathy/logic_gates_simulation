import { InputIOContainer, OutputIOContainer } from "./IOContainer";
import { select } from "./utils";
import Simulation from "./core/Simulation";

export default class SimulationController {
  sim: Simulation;
  inputContainer: InputIOContainer;
  outputContainer: OutputIOContainer;
  isTesting: boolean = false;
  constructor(inCount: number, outCount: number) {
    const inputIOValues = new Array(inCount).fill(false);
    const ele = select("#gameMain");
    const canvas = select<HTMLCanvasElement>("#gameCanvas");
    this.sim = new Simulation(inputIOValues, outCount, ele, canvas);

    const inputIOContainer = select("#inputIOContainer");
    this.inputContainer = new InputIOContainer(
      inputIOContainer,
      inputIOValues,
      (i: number, v: boolean) => this.sim.updateInput(i, v)
    );
    const outputIOContainer = select("#outputIOContainer");
    this.outputContainer = new OutputIOContainer(
      outputIOContainer,
      outCount
    );
  }
  setInput(values: boolean[]) {
    if (values.length !== this.sim.inputCount) throw "invalid values length";
    for (let i = 0; i < values.length; i++) {
      this.inputContainer.updateInput(i, values[i]);
    }
  }
  cycle() {
    if (this.isTesting) return;
    this.sim.cycle();
    this.outputContainer.update(this.sim.fetchOutputs());
  }
  test(inputs: number[][], outputs: number[][]) {
    if (inputs.length !== outputs.length) throw "invalid test";
    this.isTesting = true;
    console.log("testing")
    const beforeTest = [...this.inputContainer.inputIOValues];
    for (let i = 0; i < inputs.length; i++) {
      this.setInput(inputs[i].map(Boolean));
      this.sim.cycle();
      const outs = this.sim.fetchOutputs();
      const isEqual = outs.reduce(
        (p, c, j) => p && c == Boolean(outputs[i][j]),
        true
      );
      if (!isEqual) {
        console.log(outs, outputs[i]);
        this.isTesting = false;
        console.log("complete")
        return false;
      }
      //await delay(100);
    }
    this.setInput(beforeTest);
    this.isTesting = false;
    return true;
  }
}
