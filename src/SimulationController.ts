import { OutputIOContainer } from "./IOContainer";
import { select } from "./utils";
import Simulation from "./core/Simulation";

export default class SimulationController {
  sim: Simulation;
  outputContainer: OutputIOContainer;
  isTesting: boolean = false;
  constructor(inCount: number, outCount: number) {
    const inputIOValues = new Array(inCount).fill(false);
    const ele = select("#gameMain");
    const canvas = select<HTMLCanvasElement>("#gameCanvas");
    this.sim = new Simulation(ele, canvas);

    const outputIOContainer = select("#outputIOContainer");
    this.outputContainer = new OutputIOContainer(
      outputIOContainer,
      outCount
    );
  }
  cycle() {
    if (this.isTesting) return;
    this.sim.cycle();
  }
}
