import { LogicGateFunction } from "./Gates";
import {
  DisplayOutputHandler,
  InputHandlerNew,
  OutputHandlerNew,
  SimpleInputHandler,
  SimpleOutputHandler,
} from "./IOHandler";

export interface GateInfo {
  in: number;
  out: number;
  width: number;
  labels: {
    in: string[];
    out: string[];
  };
  logic: LogicGateFunction[];
}

const commonBasic = {
  width: 150,
  labels: {
    in: [],
    out: [],
  },
};

const basicGates: { [key: string]: GateInfo } = {
  AND: {
    ...commonBasic,
    in: 2,
    out: 1,
    logic: [(ins) => ins[0] && ins[1]],
  },
  OR: {
    ...commonBasic,
    in: 2,
    out: 1,
    logic: [(ins) => ins[0] || ins[1]],
  },
  XOR: {
    ...commonBasic,
    in: 2,
    out: 1,
    logic: [(ins) => !(ins[0] == ins[1])],
  },
  BUFFER: {
    ...commonBasic,
    in: 1,
    out: 1,
    logic: [(ins) => ins[0]],
  },
  NOT: {
    ...commonBasic,
    in: 1,
    out: 1,
    logic: [(ins) => !ins[0]],
  },
};

const commonArithmatic = {
  width: 200,
};
const arithmaticGates: { [key: string]: GateInfo } = {
  "HALF ADDER": {
    ...commonArithmatic,
    labels: {
      in: ["a", "b"],
      out: ["s", "c"],
    },
    in: 2,
    out: 2,
    logic: [(ins) => ins[0] !== ins[1], (ins) => ins[0] && ins[1]],
  },
  "FULL ADDER": {
    ...commonArithmatic,
    labels: {
      in: ["a", "b", "c"],
      out: ["s", "c"],
    },
    in: 3,
    out: 2,
    logic: [
      (ins) => (ins[0] !== ins[1]) !== ins[2],
      (ins) => ins.map(Number).reduce((a, b) => a + b, 0) > 1,
    ],
  },
  "HALF SUBTRACTOR": {
    ...commonArithmatic,
    labels: {
      in: ["a", "b"],
      out: ["d", "b"],
    },
    in: 2,
    out: 2,
    logic: [(ins) => ins[0] !== ins[1], (ins) => !ins[0] && ins[1]],
  },
  "FULL SUBTRACTOR": {
    ...commonArithmatic,
    labels: {
      in: ["a", "b", "c"],
      out: ["d", "b"],
    },
    in: 3,
    out: 2,
    logic: [
      (ins) => (ins[0] !== ins[1]) !== ins[2],
      (ins) => (ins[0] ? ins[1] && ins[2] : ins[1] || ins[2]),
    ],
  },
};

const commonCoders = {
  width: 200,
};

const binaryToDecimal = (
  arr: boolean[],
  start = 0,
  end = arr.length
): number => {
  let decimal = 0;
  for (let i = start, x = 1; i < end; i++, x *= 2) if (arr[i]) decimal += x;
  return decimal;
};

function Decoder(n: number): GateInfo {
  const logic: LogicGateFunction[] = [];
  const pn = Math.pow(2, n);
  for (let i = 0; i < pn; i++) {
    logic.push((ins) => (ins[n] ? binaryToDecimal(ins, 0, n) === i : false));
  }
  return {
    ...commonCoders,
    in: n + 1,
    labels: {
      in: new Array(n + 1).fill("b").map((s, i) => (i == n ? "En" : s + i)),
      out: new Array(pn).fill("s").map((s, i) => s + i),
    },
    out: pn,
    logic,
  };
}

function Encoder(n: number): GateInfo {
  const logic: LogicGateFunction[] = [];
  const pn = Math.pow(2, n);
  for (let i = 0, x = 1; i < n; i++, x *= 2)
    logic.push((ins) => Math.floor(ins.lastIndexOf(true) / x) % 2 !== 0);
  logic.push((ins) => ins.includes(true));
  return {
    ...commonCoders,
    labels: {
      in: new Array(pn).fill("s").map((s, i) => s + i),
      out: new Array(n + 1).fill("b").map((s, i) => (i == n ? "En" : s + i)),
    },
    in: pn,
    out: n + 1,
    logic,
  };
}

const coders: { [key: string]: GateInfo } = {
  "2 - 4 LINE DECODER": Decoder(2),
  "4 - 2 LINE ENCODER": Encoder(2),
  "3 - 8 LINE DECODER": Decoder(3),
  "8 - 3 LINE ENCODER": Encoder(3),
  "4 - 16 LINE DECODER": Decoder(4),
  "16 - 4 LINE ENCODER": Encoder(4),
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
  "8 BIT INPUT": {
    count: 8,
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
  "2 BIT DECIMAL DISPLAY": {
    count: 2,
    handler: DisplayOutputHandler,
  },
  "4 BIT OUTPUT": {
    count: 4,
    handler: SimpleOutputHandler,
  },
  "4 BIT DECIMAL DISPLAY": {
    count: 4,
    handler: DisplayOutputHandler,
  },
  "8 BIT OUTPUT DISPLAY": {
    count: 8,
    handler: SimpleOutputHandler,
  },
  "8 BIT DECIMAL DISPLAY": {
    count: 8,
    handler: DisplayOutputHandler,
  },
};

export default {
  Inputs: inputs,
  Outputs: outputs,
  "Basic Gates": basicGates,
  "Adders/Subtractors": arithmaticGates,
  "Encoders/Decoders": coders,
};
