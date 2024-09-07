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
    logic: (ins) => ins[0] && ins[1]
  },
  OR: {
    in: 2,
    out: 1,
    logic: (ins) => ins[0] || ins[1]
  },
  XOR: {
    in: 2,
    out: 1,
    logic: (ins) => !(ins[0] == ins[1])
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
  }

  fetchAllInputs(): boolean[] {
    const ins: boolean[] = [];
    for (let i = 0; i < this.inCount; i++) {
      const inputGate = this.inputs[i],
        index = this.inputsIndex[i];
      if (inputGate) {
        if (index == null) throw "Index not found for Gate";
        else ins.push(inputGate.fetchOutput(index));
      } else ins.push(false);
    }
    return ins;
  }

  fetchOutput(index: number): boolean {
    return this.outputCaches[index];
  }

  fetchAllOutput(): boolean[] {
    const outs = [];
    for (let i = 0; i < this.outCount; i++) outs.push(this.fetchOutput(i));
    return outs;
  }

  computeOutput() {
    const inputValues = this.fetchAllInputs();
    for (let i = 0; i < this.outCount; i++) {
      this.outputCaches[i] = this.outLogicFuncs[i](inputValues);
    }
  }

  setInput(asIndex: number, inputGate: Gate, gateIndex: number): boolean {
    if (asIndex < 0 || asIndex >= this.inCount)
      throw "cannot setInput for " + asIndex;
    if (this.inputsIndex[asIndex] != null) return false;
    this.inputs[asIndex] = inputGate;
    this.inputsIndex[asIndex] = gateIndex;
    return true;
  }

  removeInput(index: number) {
    if (index < 0 || index >= this.inCount)
      throw "cannot removeInput for " + index;
    this.inputsIndex[index] = null;
    this.inputs[index] = null;
  }
}
