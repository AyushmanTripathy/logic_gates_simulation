import { Box, Connector } from "./Basic.js";
import { Gate, logicFuncs } from "./Gates.js";

const fixedBuffer = (a, i) => {
  return () => a[i];
};

export default class Simulation {
  /**
   * @param {number[]} inputValuesArr
   * @param {number} outputCount
   * @param {HTMLElement} mainEle
   * @param {HTMLCanvasElement} canvasEle
   */
  constructor(inputValuesArr, outputCount, mainEle, canvasEle) {
    new Connector(mainEle, canvasEle);
    globalThis.gridHeight = mainEle.clientHeight;
    globalThis.gridWidth = mainEle.clientWidth;

    this.inputValues = [...inputValuesArr];
    this.inputCount = inputValuesArr.length;
    this.outputCount = outputCount;

    let inputBufferFuncs = [];
    for (let i = 0; i < this.inputCount; i++) {
      inputBufferFuncs.push(fixedBuffer(this.inputValues, i));
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
    this.outputBufferGate = new Gate("OUTPUT BUFFER", outputCount, []);
    const outputBox = new Box(
      mainEleRect.width,
      mainEleRect.height / 2 - 100,
      50,
      200,
      this.outputBufferGate
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
  }

  /**
   * @param {number} index
   * @param {boolean} value
   * */
  updateInput(index, value) {
    if (index < 0 || this.inputCount <= index)
      throw "cannot update index " + index;
    if (typeof value != "boolean") throw "cannot update to value " + value;
    this.inputValues[index] = value;
  }
  /**
   * @returns {boolean[]}
   * */
  fetchOutputs() {
    return this.outputBufferGate.fetchAllInputs();
  }
}
