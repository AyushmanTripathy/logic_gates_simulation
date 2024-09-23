import { config } from "./config";
import { select } from "./utils";
import SimulationController from "./SimulationController";
import Modal from "./Modal";

const cssRoot = select<HTMLElement>(":root");

init();
async function init() {
  const modal = new Modal(select("dialog"));
  document.title = config.appName;

  const simController = new SimulationController(3, 2);
  setInterval(() => simController.cycle(), config.cycleInterval);

  const showDialogFunctions: { [key: string]: Function } = {};
  for (const dialogId of ["helpDialog", "infoDialog"]) {
    const dialog = select<HTMLDialogElement>("#" + dialogId);
    dialog
      .querySelector("button")
      .addEventListener("click", () => dialog.close());
    showDialogFunctions[dialogId] = () => dialog.showModal();
    select(`#${dialogId}OpenBtn`).onclick = () => dialog.showModal();
  }
  showDialogFunctions["helpDialog"]();
}
