import { config } from "./config";
import { select } from "./utils";
import SimulationController from "./SimulationController";
import Modal from "./Modal";

const cssRoot = select<HTMLElement>(":root");

init();
async function init() {
  const modal = new Modal(select("dialog"));
  document.title = config.appName;

  // Simulation
  const simController = new SimulationController(3, 2);
  setInterval(() => simController.cycle(), config.cycleInterval);
}
