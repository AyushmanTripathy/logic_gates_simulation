import Box from "./Box.js";

/**
 * Init function
 * @param {HTMLElement} mainEle  
 * @returns {void}
 */
export default function init(mainEle) {
  globalThis.gridHeight = mainEle.clientHeight;
  globalThis.gridWidth = mainEle.clientWidth;
  let counter = 0;
  mainEle.addEventListener("contextmenu", (e) => {
    // ignore bubbled events
    if (e.target != mainEle) return;
    e.preventDefault();
    const b = new Box(e.offsetX,e.offsetY,100, 100, counter++);
    b.render(mainEle);
  })
}
