export const logicFuncs = {
  AND: (ins) => {
    for (const x of ins) {
      if (!x) return false;
    }
    return true;
  },
  BUFFER: (ins) => ins[0],
  NOT: (ins) => !ins[0],
};

const cacheInvalidTime = 500;

export class Gate {
  /**
   * @param {String} name
   * @param {number} inCount
   * @param {CallableFunction[]} outLogicFuncs
   * */
  constructor(name, inCount, outLogicFuncs) {
    this.name = name;
    this.inCount = inCount;
    /**
     * @type {Gate[]} inputs
     * */
    this.inputs = new Array(inCount).fill(null);
    this.inputsIndex = new Array(inCount).fill(null);
    this.outCount = outLogicFuncs.length;
    this.outLogicFuncs = outLogicFuncs;
    this.outputCaches = new Array(this.outCount).fill(null);
  }

  /**
   * @returns {boolean[]}
   * */
  fetchAllInputs() {
    const ins = [];
    for (let i = 0; i < this.inCount; i++) {
      if (this.inputs[i])
        ins.push(this.inputs[i].fetchOutput(this.inputsIndex[i]));
      else ins.push(false);
    }
    return ins;
  }
  /**
   * @param {number} index
   * fetches the value from the gate
   * @returns {boolean}
   * */
  fetchOutput(index) {
    if (0 > index || index >= this.outCount)
      throw "Cannot fetchOutput for " + index;
    if (this.outputCaches[index] === null) {
      this.outputCaches[index] = this.outLogicFuncs[index](this.fetchAllInputs());
      setTimeout(() => this.outputCaches[index] = null, cacheInvalidTime);
    }
    return this.outputCaches[index];
  }

  /**
   * @returns {boolean[]}
   * */
  fetchAllOutput() {
    const outs = [];
    for (let i = 0; i < this.outCount; i++) outs.push(this.fetchOutput(i));
    return outs;
  }
  /**
   * @param {Gate} inputGate
   * @param {number} asIndex
   * @param {number} gateIndex
   * @returns {boolean}
   * */
  setInput(asIndex, inputGate, gateIndex) {
    if (asIndex < 0 || asIndex >= this.inCount)
      throw "cannot setInput for " + asIndex;
    if (this.inputsIndex[asIndex] != null) return false;
    this.inputs[asIndex] = inputGate;
    this.inputsIndex[asIndex] = gateIndex;
    return true;
  }

  removeInput(index) {
    if (index < 0 || index >= this.inCount)
      throw "cannot removeInput for " + index;
    this.inputsIndex[index] = null;
    this.inputs[index] = null;
  }
}
