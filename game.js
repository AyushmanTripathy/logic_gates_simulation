import { Box, Connector } from "./Box.js";

/**
 * Init function
 * @param {HTMLElement} mainEle
 * @param {HTMLCanvasElement} canvasEle
 * @returns {void}
 */
export default function init(mainEle, canvasEle) {
  new Connector(mainEle, canvasEle);
  globalThis.gridHeight = mainEle.clientHeight;
  globalThis.gridWidth = mainEle.clientWidth;

  let counter = 0;
  mainEle.addEventListener("contextmenu", (e) => {
    // ignore bubbled events
    if (e.target != mainEle) return;
    e.preventDefault();
    const b = new Box(e.offsetX,e.offsetY,100, 100, counter++);
    console.log(b)
    b.render(mainEle);

    b.ele.addEventListener("click", () => console.log(b))
  })
}
