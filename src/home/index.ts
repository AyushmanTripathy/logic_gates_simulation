import { config } from "../config";
import { Unit } from "../units";
import { loadContent, select } from "../utils";
import { ProgressStorage } from "./Storage";

document.title = config.appName;
console.log(config.appName + " started");

init();
async function init() {
  const unitsContainer = select("#unitsContainer");
  const units: Unit[] = await loadContent("units");
  const progress = new ProgressStorage(units.map((x) => x.levels.length));
  hydrateUnitsContainer(unitsContainer, units, progress);
}

function handleLevelDivClick(ui: number, li: number) {
  return () => (window.location.href = `/sim.html?ui=${ui}&li=${li}`);
}

function hydrateUnitsContainer(
  unitsContainer: HTMLElement,
  units: Unit[],
  progress: ProgressStorage
) {
  for (let ui = 0; ui < units.length; ui++) {
    const unit = units[ui];
    unitsContainer.appendChild(
      createUnitDiv(unit, ...progress.checkUnitStatus(ui))
    );
    for (let li = 0; li < unit.levels.length; li++)
      unitsContainer.appendChild(
        createLevelDiv(
          unit.levels[li],
          progress.checkLevelStatus(ui, li),
          ui,
          li
        )
      );
  }
}

function createLevelDiv(
  level: string,
  status: boolean,
  ui: number,
  li: number
): HTMLElement {
  const levelDiv = document.createElement("div");
  levelDiv.classList.add("levelDiv");
  if (status) levelDiv.classList.add("completed");
  levelDiv.onclick = handleLevelDivClick(ui, li);
  const levelP = document.createElement("p");
  levelP.innerText = level;
  levelDiv.appendChild(levelP);
  return levelDiv;
}

function createUnitDiv(
  unit: Unit,
  status: boolean,
  done: number,
  total: number
): HTMLElement {
  const unitDiv = document.createElement("div");
  unitDiv.classList.add("unitDiv");
  if (status) unitDiv.classList.add("completed");
  const unitH3 = document.createElement("h1");
  unitH3.innerText = unit.title;
  unitDiv.appendChild(unitH3);
  const unitP = document.createElement("p");
  unitP.innerText = `${done}/${total}`;
  unitDiv.appendChild(unitP);
  return unitDiv;
}
