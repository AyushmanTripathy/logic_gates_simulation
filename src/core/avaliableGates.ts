import { LogicGateFunction } from "./Gates";
import {
  DisplayOutputHandler,
  InputHandlerNew,
  OutputHandlerNew,
  SimpleInputHandler,
  SimpleOutputHandler,
} from "./IOHandler";

function generateLabels(c: string, n: number): string[] {
  const arr = [];
  for (let i = 0; i < n; i++) arr.push(c + i);
  return arr;
}

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
  NAND: {
    ...commonBasic,
    in: 2,
    out: 1,
    logic: [(ins) => !(ins[0] && ins[1])],
  },
  NOR: {
    ...commonBasic,
    in: 2,
    out: 1,
    logic: [(ins) => !(ins[0] || ins[0])],
  },
  XOR: {
    ...commonBasic,
    in: 2,
    out: 1,
    logic: [(ins) => !(ins[0] == ins[1])],
  },
  XNOR: {
    ...commonBasic,
    in: 2,
    out: 1,
    logic: [(ins) => ins[0] == ins[1]],
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

const binaryToDecimal = (
  arr: boolean[],
  start = 0,
  end = arr.length
): number => {
  let decimal = 0;
  for (let i = start, x = 1; i < end; i++, x *= 2) if (arr[i]) decimal += x;
  return decimal;
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
      in: [...generateLabels("b", n), "En"],
      out: generateLabels("s", pn),
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
      in: generateLabels("s", pn),
      out: [...generateLabels("b", n), "En"],
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

const commonComparators = {
  width: 250,
};

function MagnitudeComparator(n: number): GateInfo {
  return {
    ...commonComparators,
    in: n * 2,
    out: 3,
    labels: {
      in: [...generateLabels("a", n), ...generateLabels("b", n)],
      out: ["Lt", "Eq", "Gt"],
    },
    logic: [
      (ins) => binaryToDecimal(ins, 0, n) < binaryToDecimal(ins, n, n * 2),
      (ins) => binaryToDecimal(ins, 0, n) == binaryToDecimal(ins, n, n * 2),
      (ins) => binaryToDecimal(ins, 0, n) > binaryToDecimal(ins, n, n * 2),
    ],
  };
}

const comparators: { [key: string]: GateInfo } = {
  "4 BIT COMPARATOR": MagnitudeComparator(4),
  "8 BIT COMPARATOR": MagnitudeComparator(8),
};

const commonMuxers = {
  width: 200,
};

function Multiplexer(n: number): GateInfo {
  const pn = Math.pow(2, n);
  return {
    ...commonMuxers,
    in: pn + n,
    out: 1,
    labels: {
      in: [...generateLabels("y", pn), ...generateLabels("s", n)],
      out: ["D"],
    },
    logic: [(ins) => ins[binaryToDecimal(ins, pn, pn + n)]],
  };
}

function Demultiplexer(n: number): GateInfo {
  const pn = Math.pow(2, n);
  const logic = [];
  for (let i = 0; i < pn; i++) {
    logic.push((ins) => (binaryToDecimal(ins, 1) == i ? ins[0] : false));
  }
  return {
    ...commonMuxers,
    in: 1 + n,
    out: pn,
    labels: {
      in: ["D", ...generateLabels("s", n)],
      out: generateLabels("y", pn),
    },
    logic,
  };
}

const muxers: { [key: string]: GateInfo } = {
  "1 - 2 LINE MUX": Multiplexer(1),
  "1 - 2 LINE DEMUX": Demultiplexer(1),
  "1 - 4 LINE MUX": Multiplexer(2),
  "1 - 4 LINE DEMUX": Demultiplexer(2),
  "1 - 8 LINE MUX": Multiplexer(3),
  "1 - 8 LINE DEMUX": Demultiplexer(3),
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
  Comparators: comparators,
  "MUX/DEMUX": muxers,
};
