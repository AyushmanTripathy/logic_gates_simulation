import { config } from "../config";
import { loadContent, select } from "../utils";

document.title = config.appName;
console.log(config.appName + " started");

init();
async function init() {
  const unitsContainer = select("#unitsContainer");
  const units = await loadContent("units");
  hydrateUnitsContainer(unitsContainer, units);
}

function handleLevelDivClick(i) {
  return () => console.log(i + " cliked");
}

function hydrateUnitsContainer(unitsContainer: HTMLElement, units: any) {
  for (const unit of units) {
    unitsContainer.appendChild(createUnitDiv(unit));
    for (let i = 0; i < unit.levels.length; i++)
      unitsContainer.appendChild(createLevelDiv(unit.levels[i], i));
  }
}

function createLevelDiv(level: string, index: number): HTMLElement {
  const levelDiv = document.createElement("div");
  levelDiv.classList.add("levelDiv");
  levelDiv.onclick = handleLevelDivClick(index);
  const levelP = document.createElement("p");
  levelP.innerText = level;
  levelDiv.appendChild(levelP);
  return levelDiv;
}

function createUnitDiv(unit: any): HTMLElement {
  const unitDiv = document.createElement("div");
  unitDiv.classList.add("unitDiv");
  const unitH3 = document.createElement("h1");
  unitH3.innerText = unit.title;
  unitDiv.appendChild(unitH3);
  const unitP = document.createElement("p");
  unitP.innerText = "10/10";
  unitDiv.appendChild(unitP);
  return unitDiv;
}
