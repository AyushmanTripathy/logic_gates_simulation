import { LogicGateFunction } from "./sim/Gates"

export interface Level {
  inCount: number,
  outCount: number,
  title: string,
  description: string,
  table: {
    labels: string[],
    rows: number[][]
  },
  gates: string[]
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
