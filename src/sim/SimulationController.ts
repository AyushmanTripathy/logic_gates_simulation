import { Level } from "../units";
import { select } from "../utils";
import { InputIOContainer, OutputIOContainer } from "./IOContainer";
import Simulation from "./Simulation";

export default class SimulationController {
  sim: Simulation;
  inputIOValues: boolean[];
  inputs: InputIOContainer;
  outputs: OutputIOContainer;
  constructor(level: Level) {
    this.inputIOValues = new Array(level.inCount).fill(false);
    const ele = select("#gameMain");
    const canvas = select<HTMLCanvasElement>("#gameCanvas");
    this.sim = new Simulation(this.inputIOValues, level.outCount, ele, canvas);

    const inputIOContainer = select("#inputIOContainer");
    this.inputs = new InputIOContainer(
      inputIOContainer,
      this.inputIOValues,
      (i: number, v: boolean) => this.sim.updateInput(i, v)
    );
    const outputIOContainer = select("#outputIOContainer");
    this.outputs = new OutputIOContainer(outputIOContainer, level.outCount);
  }
  cycle() {
    this.sim.cycle();
    this.outputs.update(this.sim.fetchOutputs());
  }
}
