export type LogicGateFunction = (ins: boolean[]) => boolean;

export class Gate {
  name: string;
  inCount: number;
  inputs: (Gate | null)[];
  inputsIndex: (number | null)[];
  outCount: number;
  outLogicFuncs: LogicGateFunction[];
  outputCaches: boolean[];
  outputCallbacks: (Object | null)[];
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
    this.outputCallbacks = [];
    for (let i = 0; i < this.outCount; i++) this.outputCallbacks.push({});
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
      const val = this.outLogicFuncs[i](inputValues);
      for (const hash in this.outputCallbacks[i])
        this.outputCallbacks[i][hash](val);
      this.outputCaches[i] = val;
    }
  }

  setOutputCallback(
    index: number,
    hash: string,
    callback: (arg0: boolean) => void
  ) {
    if (index < 0 || index >= this.outCount)
      throw "cannot setOutputCallback for " + index;
    this.outputCallbacks[index][hash] = callback;
  }

  removeOutputCallback(index: number, hash: string) {
    if (index < 0 || index >= this.outCount)
      throw "cannot removeOutputCallback for " + index;
    if (this.outputCallbacks[index][hash])
      delete this.outputCallbacks[index][hash];
    else throw "cannot removeOutputCallback for hash " + hash;
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
