import { dimensions } from "../config";
import { Box } from "./Basic";
import { Gate } from "./Gates";
import {
  InputHandler,
  InputHandlerNew,
  OutputHandler,
  OutputHandlerNew,
} from "./IOHandler";

function labelNames(c: string, n: number): string[] {
  const arr = [];
  for (let i = 0; i < n; i++) arr.push(c + i);
  return arr;
}

export class InputBox extends Box {
  handler: InputHandler;
  constructor(
    inputHandler: InputHandler,
    x: number,
    y: number,
    sh: number,
    sw: number,
    gate: Gate
  ) {
    const labels = {
      in: [],
      out: [],
    };
    super(x, y, labels, dimensions.input.width, sh, sw, gate);
    super.element.classList.add("IOBox");
    this.handler = inputHandler;
  }

  static createInputGate(
    outCount: number,
    Handler: InputHandlerNew
  ): [Gate, InputHandler] {
    const inputValues = new Array(outCount).fill(false);
    const fixedBuffer = (a: boolean[], i: number) => {
      return () => a[i];
    };
    let inputBufferFuncs = [];
    for (let i = 0; i < outCount; i++) {
      inputBufferFuncs.push(fixedBuffer(inputValues, i));
    }
    const gate = new Gate("INPUT", 0, inputBufferFuncs);
    const handler = new Handler(
      inputValues,
      (i: number, v: boolean) => (inputValues[i] = v)
    );
    return [gate, handler];
  }

  destroy() {
    super.destroy();
    this.handler.destroy();
  }

  render(parentEle: HTMLElement) {
    super.render(parentEle);
    this.handler.render(parentEle);
    this.handler.bind(super.element);
  }
}

export class OutputBox extends Box {
  handler: OutputHandler;
  constructor(
    handler: OutputHandler,
    x: number,
    y: number,
    sh: number,
    sw: number,
    gate: Gate
  ) {
    const labels = {
      in: [],
      out: [],
    };
    super(x, y, labels, dimensions.output.width, sh, sw, gate);
    super.element.classList.add("IOBox");
    this.handler = handler;
  }

  static createOutputGate(
    inCount: number,
    Handler: OutputHandlerNew
  ): [Gate, OutputHandler] {
    const gate = new Gate("OUTPUT", inCount, []);
    const handler = new Handler(inCount);
    return [gate, handler];
  }

  destroy() {
    super.destroy();
    this.handler.destroy();
  }

  render(parentEle: HTMLElement) {
    super.render(parentEle);
    this.handler.render(parentEle);
    this.handler.bind(super.element);
  }
}
