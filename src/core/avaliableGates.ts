import { LogicGateFunction } from "./Gates";
import {
  DisplayOutputHandler,
  InputHandlerNew,
  OutputHandlerNew,
  SimpleInputHandler,
  SimpleOutputHandler,
} from "./IOHandler";

interface LogicGateInfo {
  in: number;
  out: number;
  height: number;
  width: number;
  logic: LogicGateFunction[];
}

const gateDimensions = {
  height: 100,
  width: 150,
};

const basicGates: { [key: string]: LogicGateInfo } = {
  AND: {
    ...gateDimensions,
    in: 2,
    out: 1,
    logic: [(ins) => ins[0] && ins[1]],
  },
  OR: {
    ...gateDimensions,
    in: 2,
    out: 1,
    logic: [(ins) => ins[0] || ins[1]],
  },
  XOR: {
    ...gateDimensions,
    in: 2,
    out: 1,
    logic: [(ins) => !(ins[0] == ins[1])],
  },
  BUFFER: {
    ...gateDimensions,
    in: 1,
    out: 1,
    logic: [(ins) => ins[0]],
  },
  NOT: {
    ...gateDimensions,
    in: 1,
    out: 1,
    logic: [(ins) => !ins[0]],
  },
};

export interface InputInfo {
  count: number;
  handler: InputHandlerNew;
}

const inputs: { [key: string]: InputInfo } = {
  "1 BIT INPUT": {
    count: 1,
    handler: SimpleInputHandler,
  },
  "4 BIT INPUT": {
    count: 4,
    handler: SimpleInputHandler,
  },
};

export interface OutputInfo {
  count: number;
  handler: OutputHandlerNew;
}

const outputs: { [key: string]: OutputInfo } = {
  "1 BIT OUTPUT": {
    count: 1,
    handler: SimpleOutputHandler,
  },
  "4 BIT OUTPUT": {
    count: 4,
    handler: SimpleOutputHandler,
  },
  "4 BIT DECIMAL DISPLAY": {
    count: 4,
    handler: DisplayOutputHandler,
  },
};

export default {
  Inputs: inputs,
  Outputs: outputs,
  "Basic Gates": basicGates,
};
