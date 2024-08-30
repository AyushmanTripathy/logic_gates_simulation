import { Box, Connector } from "./Basic.js";
import { Gate, logicFuncs } from "./Gates.js";

const fixedBuffer = (a, i) => {
  return () => a[i];
};

/**
 * Init function
 * @param {number[]} inputValues 
 * @param {number} outputCount
 * @param {HTMLElement} mainEle
 * @param {HTMLCanvasElement} canvasEle
 * @returns {void}
 */

export default function init(inputValues, outputCount, mainEle, canvasEle) {
  new Connector(mainEle, canvasEle);
  globalThis.gridHeight = mainEle.clientHeight;
  globalThis.gridWidth = mainEle.clientWidth;

  const inputCount = inputValues.length;

  let inputBufferFuncs = [];
  for (let i = 0; i < inputCount; i++) {
    inputBufferFuncs.push(fixedBuffer(inputValues, i));
  }

  const mainEleRect = mainEle.getBoundingClientRect();
  const inputBufferGate = new Gate("INPUT BUFFER", 0, inputBufferFuncs);
  const inputBox = new Box(
    0,
    mainEleRect.height / 2 - 100,
    50,
    200,
    inputBufferGate
  );
  const outputBufferGate = new Gate("OUTPUT BUFFER", outputCount, []);
  const outputBox = new Box(
    mainEleRect.width,
    mainEleRect.height / 2 - 100,
    50,
    200,
    outputBufferGate
  );

  inputBox.render(mainEle);
  outputBox.render(mainEle);

  mainEle.addEventListener("contextmenu", (e) => {
    // ignore bubbled events
    if (e.target != mainEle) return;
    e.preventDefault();
    const andGate = new Gate("AND", 2, [logicFuncs.AND]);
    const b = new Box(e.offsetX, e.offsetY, 100, 100, andGate);
    b.render(mainEle);

    b.ele.addEventListener("click", () => console.log(b));
  });

  return () => outputBufferGate.fetchAllInputs();
}
