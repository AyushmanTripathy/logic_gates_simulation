import { LogicGateFunction } from "./sim/Gates"

export interface Level {
  inCount: number,
  outCount: number,
  title: string,
  description: string,
  table: {
    labels: {
      inputs: string[],
      outputs: string[]
    }
    rows: {
      inputs: number[][],
      outputs: number[][]
    }
  },
  gates: string[]
}

export interface Unit {
  title: string,
  levels: string[]
}
