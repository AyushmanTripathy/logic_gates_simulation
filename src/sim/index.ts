import Simulation from "./Simulation";
import { config } from "../config";
import { loadContent, select } from "../utils";
import { InputIOContainer, OutputIOContainer } from "./IOContainer";
import { Level } from "../units";

const cssRoot = select<HTMLElement>(":root");

init();

async function init() {
  const level: Level | false = await fetchLevel();
  if (level === false) return window.location.href = "/";

  document.title = level.title;

  // Simulation
  const cycle = createSimulation(level);
  setInterval(cycle, config.cycleInterval);

  // UI
  addSimBtnsHandlers(select("#simCollapseBtn"), select("#simExpandBtn"));
  hydrateArticle(select("#descriptionMain"), level);
}

function createSimulation(level: Level): Function {
  const inputIOValues = new Array(level.inCount).fill(false);
  const ele = select("#gameMain");
  const canvas = select<HTMLCanvasElement>("#gameCanvas");
  const sim = new Simulation(inputIOValues, level.outCount, ele, canvas);

  const inputIOContainer = select("#inputIOContainer");
  const inputs = new InputIOContainer(
    inputIOContainer,
    inputIOValues,
    (i: number, v: boolean) => sim.updateInput(i, v)
  );
  const outputIOContainer = select("#outputIOContainer");
  const outputs = new OutputIOContainer(outputIOContainer, level.outCount);
  return () => {
    sim.cycle();
    outputs.update(sim.fetchOutputs());
  };
}

// BUTTONS

function addSimBtnsHandlers(
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
  table.appendChild(createRow(level.table.labels));
  for (let x = 0; x < level.table.rows.length; x++)
    table.appendChild(createRow(level.table.rows[x]));

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
