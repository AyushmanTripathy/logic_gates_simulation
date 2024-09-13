import Simulation from "./Simulation";
import { config } from "./config";
import { InputIOContainer, OutputIOContainer } from "./IOContainer";

interface LevelDetails {
  inCount: number,
  outCount: number,
  title: string,
  description: string,
  table: {
    labels: string[],
    rows: number[][]
  }
}

const level: LevelDetails = {
  inCount: 3,
  outCount: 2,
  title: "NAND Madness",
  description: "random description to be here, too boring to read anyways",
  table: {
    labels: ["A", "B", "Y"],
    rows: [
      [0, 0, 1],
      [0, 1, 1],
      [1, 0, 1],
      [1, 1, 0],
    ],
  },
};

function select<T extends Element = HTMLElement>(query: string): T {
  const ele = document.querySelector<T>(query);
  if (!ele) throw "element not found for " + query;
  return ele;
}

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

setInterval(() => {
  sim.cycle();
  outputs.update(sim.fetchOutputs());
}, config.cycleInterval);

// BUTTONS
const cssRoot = select<HTMLElement>(":root");

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
addSimBtnsHandlers(select("#simCollapseBtn"), select("#simExpandBtn"));

// DESCRIPTION
function hydrateArticle(article: HTMLElement, details: LevelDetails) {
  const title = document.createElement("h2");
  title.innerHTML = details.title;
  const desc = document.createElement("p");
  desc.innerHTML = details.description;
  const table = document.createElement("table");
  const createRow = (arr: (string | number)[]) => {
    const row = document.createElement("tr");
    for (let i = 0; i < arr.length; i++) {
      const cell = document.createElement(typeof arr[i] == "string" ? "th" : "td");
      cell.innerHTML = arr[i].toString();
      row.appendChild(cell);
    }
    return row;
  }
  table.appendChild(createRow(details.table.labels));
  for (let x = 0; x < details.table.rows.length; x++)
    table.appendChild(createRow(details.table.rows[x]))

  article.appendChild(title);
  article.appendChild(desc);
  article.appendChild(table);
}
hydrateArticle(select("#descriptionMain"), level);
