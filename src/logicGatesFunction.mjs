export const logicGateFunctions = {
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

