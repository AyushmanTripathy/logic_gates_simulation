import { config } from "../config";
import { loadContent, select } from "../utils";
import { Level } from "../units";
import SimulationController from "./SimulationController";
import Modal from "../Modal";

const cssRoot = select<HTMLElement>(":root");

init();
async function init() {
  const modal = new Modal(select("dialog"));
  const level: Level | false = await fetchLevel();
  if (level === false) return (window.location.href = "/");

  document.title = level.title;

  // Simulation
  const simController = new SimulationController(level);
  setInterval(() => simController.cycle(), config.cycleInterval);

  // UI
  expandCollapseBtn(select("#simCollapseBtn"), select("#simExpandBtn"));
  select("#simTestBtn").onclick = async () => {
    const stat = await simController.test(
      level.table.rows.inputs,
      level.table.rows.outputs
    );
    if (stat)
      modal.showMessage({
        title: "Congrats",
        msg: "completed",
        btns: [
          {
            name: "Next Level",
            callback: () => (window.location.href = "/"),
          },
        ],
      });
    else
      modal.showMessage({
        title: "Oops",
        msg: "",
        btns: [{ name: "Try Again", callback: () => {} }],
      });
  };
  hydrateArticle(select("#descriptionMain"), level);
}

// BUTTONS
function expandCollapseBtn(
  collapseBtn: HTMLButtonElement,
  expandBtn: HTMLButtonElement
) {
  collapseBtn.style.display = "none";
  expandBtn.onclick = () => {
    cssRoot.style.setProperty("--simHeight", "calc(100vh - 60px)");
    expandBtn.style.display = "none";
    collapseBtn.style.display = "block";
  };
  collapseBtn.onclick = () => {
    cssRoot.style.setProperty("--simHeight", "60vh");
    collapseBtn.style.display = "none";
    expandBtn.style.display = "block";
  };
}

// DESCRIPTION
function hydrateArticle(article: HTMLElement, level: Level) {
  const title = document.createElement("h2");
  title.innerHTML = level.title;
  const desc = document.createElement("p");
  desc.innerHTML = level.description;
  const table = document.createElement("table");
  const createRow = (arr: (string | number)[]) => {
    const row = document.createElement("tr");
    for (let i = 0; i < arr.length; i++) {
      const cell = document.createElement(
        typeof arr[i] == "string" ? "th" : "td"
      );
      cell.innerHTML = arr[i].toString();
      row.appendChild(cell);
    }
    return row;
  };
  table.appendChild(
    createRow([...level.table.labels.inputs, ...level.table.labels.outputs])
  );
  for (let x = 0; x < level.table.rows.inputs.length; x++)
    table.appendChild(
      createRow([...level.table.rows.inputs[x], ...level.table.rows.outputs[x]])
    );

  article.appendChild(title);
  article.appendChild(desc);
  article.appendChild(table);
}

async function fetchLevel(): Promise<Level | false> {
  const params = new URLSearchParams(window.location.href.split("?")[1]);
  const ui = Number(params.get("ui"));
  const li = Number(params.get("li"));
  if (!(params.has("li") && params.has("ui"))) return false;
  if (Number.isNaN(li) || Number.isNaN(ui)) return false;

  try {
    const level = await loadContent(`${ui}/${li}`);
    console.log(level);
    return level;
  } catch (e) {
    return false;
  }
}
