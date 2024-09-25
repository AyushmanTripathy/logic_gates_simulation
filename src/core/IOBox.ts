import { Box } from "./Basic";
import { Gate } from "./Gates";
import {
  InputHandler,
  OutputHandler,
  SimpleInputHandler,
  SimpleOutputHandler,
} from "./IOHandler";

export class InputBox extends Box {
  handler: InputHandler;
  constructor(
    inputHandler: InputHandler,
    x: number,
    y: number,
    w: number,
    h: number,
    sh: number,
    sw: number,
    gate: Gate
  ) {
    super(x, y, w, h, sh, sw, gate);
    super.getEle().classList.add("IOBox");
    this.handler = inputHandler;
  }

  static createInputGate(outCount: number): [Gate, InputHandler] {
    const inputValues = new Array(outCount).fill(false);
    const fixedBuffer = (a: boolean[], i: number) => {
      return () => a[i];
    };
    let inputBufferFuncs = [];
    for (let i = 0; i < outCount; i++) {
      inputBufferFuncs.push(fixedBuffer(inputValues, i));
    }
    const gate = new Gate("INPUT", 0, inputBufferFuncs);
    const handler = new SimpleInputHandler(
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
    this.handler.bind(super.getEle());
  }
}

export class OutputBox extends Box {
  handler: OutputHandler;
  constructor(
    handler: OutputHandler,
    x: number,
    y: number,
    w: number,
    h: number,
    sh: number,
    sw: number,
    gate: Gate
  ) {
    super(x, y, w, h, sh, sw, gate);
    super.getEle().classList.add("IOBox");
    this.handler = handler;
  }

  static createOutputGate(inCount: number): [Gate, OutputHandler] {
    const gate = new Gate("OUTPUT", inCount, []);
    const handler = new SimpleOutputHandler(inCount);
    return [gate, handler];
  }

  destroy() {
    super.destroy();
    this.handler.destroy();
  }

  render(parentEle: HTMLElement) {
    super.render(parentEle);
    this.handler.render(parentEle);
    this.handler.bind(super.getEle());
  }
}
