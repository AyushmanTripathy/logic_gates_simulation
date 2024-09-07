export type LogicGateFunction = (ins: boolean[]) => boolean;

interface LogicGateInfo {
  in: number;
  out: number;
  logic: LogicGateFunction;
}

interface LogicGateInfoMap {
  [key: string]: LogicGateInfo;
}

export const availableGates: LogicGateInfoMap = {
  AND: {
    in: 2,
    out: 1,
    logic: (ins) => {
      for (const x of ins) {
        if (!x) return false;
      }
      return true;
    },
  },
  BUFFER: {
    in: 1,
    out: 1,
    logic: (ins) => ins[0],
  },
  NOT: {
    in: 1,
    out: 1,
    logic: (ins) => !ins[0],
  },
};

export class Gate {
  /**
   * @param {String} name
   * @param {number} inCount
   * @param {LogicGateFunction[]} outLogicFuncs
   * */
  name: string;
  inCount: number;
  inputs: (Gate | null)[];
  inputsIndex: (number | null)[];
  outCount: number;
  outLogicFuncs: LogicGateFunction[];
  outputCaches: boolean[];
  constructor(
    name: string,
    inCount: number,
    outLogicFuncs: LogicGateFunction[]
  ) {
    this.name = name;
    this.inCount = inCount;
    this.inputs = new Array(inCount).fill(null);
    this.inputsIndex = new Array(inCount).fill(null);
    this.outCount = outLogicFuncs.length;
    this.outLogicFuncs = outLogicFuncs;
    this.outputCaches = new Array(this.outCount).fill(false);

    console.log(this);
  }

  /**
   * @returns {boolean[]}
   * */
  fetchAllInputs(): boolean[] {
    const ins: boolean[] = [];
    for (let i = 0; i < this.inCount; i++) {
      const inputGate = this.inputs[i], index = this.inputsIndex[i];
      if (inputGate) {
        if (index == null) throw "Index not found for Gate";
        else ins.push(inputGate.fetchOutput(index));
      } else ins.push(false);
    }
    return ins;
  }
  /**
   * @param {number} index
   * fetches the value from the gate
   * @returns {boolean}
   * */
  fetchOutput(index: number): boolean {
    if (0 > index || index >= this.outCount)
      throw "Cannot fetchOutput for " + index;
    if (this.outputCaches[index] === null) {
      this.outputCaches[index] = this.outLogicFuncs[index](
        this.fetchAllInputs()
      );
    }
    return this.outputCaches[index];
  }

  /**
   * @returns {boolean[]}
   * */
  fetchAllOutput(): boolean[] {
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
  setInput(asIndex: number, inputGate: Gate, gateIndex: number): boolean {
    if (asIndex < 0 || asIndex >= this.inCount)
      throw "cannot setInput for " + asIndex;
    if (this.inputsIndex[asIndex] != null) return false;
    this.inputs[asIndex] = inputGate;
    this.inputsIndex[asIndex] = gateIndex;
    return true;
  }

  /** @param {number} index */
  removeInput(index: number) {
    if (index < 0 || index >= this.inCount)
      throw "cannot removeInput for " + index;
    this.inputsIndex[index] = null;
    this.inputs[index] = null;
  }
}
