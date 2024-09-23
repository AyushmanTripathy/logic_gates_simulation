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
  cycle() {
    if (this.isTesting) return;
    this.sim.cycle();
    this.outputContainer.update(this.sim.fetchOutputs());
  }
}
