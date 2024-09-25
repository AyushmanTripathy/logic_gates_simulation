import { config } from "./config";
import { select } from "./utils";
import Simulation from "./core/Simulation";

init();
async function init() {
  select("#navbar").addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });

  const ele = select("#gameMain");
  const canvas = select<HTMLCanvasElement>("#gameCanvas");
  const sim = new Simulation(ele, canvas);
  setInterval(() => sim.cycle(), config.cycleInterval);

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
  showDialogFunctions["infoDialog"]();
}
