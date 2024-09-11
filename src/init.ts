import Simulation from "./Simulation.js";
import { InputIOContainer, OutputIOContainer } from "./IOContainer.js";

const level = {
  inCount: 3,
  outCount: 2,
};

const inputIOValues = new Array(level.inCount).fill(false);
const ele = document.getElementById("gameMain");
const canvas = document.querySelector<HTMLCanvasElement>("#gameCanvas");
const sim = new Simulation(inputIOValues, level.outCount, ele, canvas);

const inputIOContainer = document.getElementById("inputIOContainer");
const inputs = new InputIOContainer(inputIOContainer, inputIOValues, (i, v) =>
  sim.updateInput(i, v)
);
const outputIOContainer = document.getElementById("outputIOContainer");
const outputs = new OutputIOContainer(outputIOContainer, level.outCount);

setInterval(() => {
  sim.cycle();
  outputs.update(sim.fetchOutputs());
}, 1000);
