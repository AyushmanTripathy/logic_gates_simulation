import Simulation from "./Simulation.js";
import { config } from "./config.js";
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
const inputs = new InputIOContainer(inputIOContainer, inputIOValues, (i:number, v:boolean) =>
  sim.updateInput(i, v)
);
const outputIOContainer = document.getElementById("outputIOContainer");
const outputs = new OutputIOContainer(outputIOContainer, level.outCount);

setInterval(() => {
  sim.cycle();
  outputs.update(sim.fetchOutputs());
}, config.cycleInterval);

const collapseBtn = document.getElementById("simCollapseBtn");
const expandBtn = document.getElementById("simExpandBtn");
const cssRoot = document.querySelector<HTMLElement>(":root");

collapseBtn.style.display = "none";
expandBtn.onclick = () => {
  cssRoot.style.setProperty("--simHeight", "90vh");
  expandBtn.style.display = "none";
  collapseBtn.style.display = "block";
};
collapseBtn.onclick = () => {
  cssRoot.style.setProperty("--simHeight", "60vh");
  collapseBtn.style.display = "none";
  expandBtn.style.display = "block";
}
