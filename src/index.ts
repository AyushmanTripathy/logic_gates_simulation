import { config } from "./config";
import Simulation from "./core/Simulation";
import Notifier from "./Notifier";
import { select } from "./utils";

const notifier = new Notifier(select("#notification")) 
notifier.display("Enjoy!!!")

window.addEventListener("error", ({ error }) => {
  notifier.display(error)
})

init()
export async function init() {
    select("#navbar").addEventListener("contextmenu", (e) => {
        e.preventDefault();
    });

    const ele = select("#gameMain");
    const canvas = select<HTMLCanvasElement>("#gameCanvas");
    const sim = new Simulation(ele, canvas);
    setInterval(() => sim.cycle(), config.cycleInterval);

    const showDialogFunctions: { [key: string]: Function; } = {};
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

