import { LogicGateFunction } from "./sim/Gates"

export interface Level {
  inCount: number,
  outCount: number,
  title: string,
  description: string,
  table: {
    labels: string[],
    rows: number[][]
  }
}

export interface Unit {
  title: string,
  levels: string[]
}

interface LogicGateInfo {
  in: number;
  out: number;
  logic: LogicGateFunction;
}

interface LogicGateInfoMap {
  [key: string]: LogicGateInfo;
}

export const logicGates: LogicGateInfoMap = {
  AND: {
    in: 2,
    out: 1,
    logic: (ins) => ins[0] && ins[1],
  },
  OR: {
    in: 2,
    out: 1,
    logic: (ins) => ins[0] || ins[1],
  },
  XOR: {
    in: 2,
    out: 1,
    logic: (ins) => !(ins[0] == ins[1]),
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
