import { colors, dimensions } from "../config";

function createIODot(): HTMLElement {
  const dot = document.createElement("div");
  dot.classList.add("dot");
  return dot;
}

function matchPos(a: HTMLElement, b: HTMLElement, isInput: boolean) {
  a.style.top = b.style.top;
  const brect = b.getBoundingClientRect();
  if (isInput) a.style.left = brect.x - a.getBoundingClientRect().width + "px";
  else a.style.left = brect.x + brect.width + "px";
}

function bindWith(a: HTMLElement, b: HTMLElement, isInput: boolean) {
  matchPos(a, b, isInput);
  b.addEventListener("dragend", () => matchPos(a, b, isInput));
}

type InputHandlerCallback = (i: number, v: boolean) => void;
export type InputHandlerNew = new (arg1: boolean[], arg2: InputHandlerCallback) => InputHandler;
export abstract class InputHandler {
  ele: HTMLElement;
  constructor(ele: HTMLElement, count: number) {
    this.ele = ele;
    this.ele.classList.add("IOHandler");
    this.ele.style.height = (count * dimensions.dotHeight) + "px";
    this.ele.style.width = dimensions.input.width + "px";

    ele.addEventListener("contextmenu", (e) => e.preventDefault());
  }
  bind(boxEle: HTMLElement) {
    bindWith(this.ele, boxEle, true);
  }
  render(parentEle: HTMLElement) {
    parentEle.appendChild(this.ele);
  }
  destroy() {
    this.ele.remove();
  }
}

export class SimpleInputHandler extends InputHandler {
  dots: HTMLElement[] = [];
  inputIOValues: boolean[];
  callback: Function;

  constructor(inputIOValues: boolean[], callback: InputHandlerCallback) {
    super(document.createElement("div"), inputIOValues.length);
    this.inputIOValues = inputIOValues;
    this.callback = callback;

    for (let i = 0; i < inputIOValues.length; i++) {
      const d = createIODot();
      this.dots.push(d);
      d.style.backgroundColor = colors.dotConnectedLow;
      d.onclick = () => this.updateInput(i, !this.inputIOValues[i]);
      this.ele.appendChild(d);
    }
  }

  updateInput(index: number, val: boolean) {
    if (index < 0 || index >= this.dots.length) throw "invalid index " + index;
    this.dots[index].style.backgroundColor = val
      ? colors.dotConnectedHigh
      : colors.dotConnectedLow;
    this.inputIOValues[index] = val;
    this.callback(index, val);
  }
}

export type OutputHandlerNew = new(arg1: number) => OutputHandler;
export abstract class OutputHandler {
  ele: HTMLElement;
  constructor(ele: HTMLElement, count: number) {
    this.ele = ele;
    this.ele.classList.add("IOHandler");
    this.ele.style.height = (count * dimensions.dotHeight) + "px";
    this.ele.style.width = dimensions.output.width + "px";
    ele.addEventListener("contextmenu", (e) => e.preventDefault());
  }
  abstract handleUpdate(values: boolean[]): void;
  bind(boxEle: HTMLElement) {
    bindWith(this.ele, boxEle, false);
  }
  render(parentEle: HTMLElement) {
    parentEle.appendChild(this.ele);
  }
  destroy() {
    this.ele.remove();
  }
}

export class SimpleOutputHandler extends OutputHandler {
  dots: HTMLElement[] = [];
  inCount: number;

  constructor(inCount: number) {
    super(document.createElement("div"), inCount);
    this.inCount = inCount;

    for (let i = 0; i < inCount; i++) {
      const d = createIODot();
      d.style.backgroundColor = colors.dotConnectedLow;
      this.dots.push(d);
      this.ele.appendChild(d);
    }
  }

  handleUpdate(values: boolean[]): void {
    if (values.length !== this.inCount)
      throw "Invalid values length";
    for (let i = 0; i < this.inCount; i++)
      this.dots[i].style.backgroundColor = values[i]
        ? colors.dotConnectedHigh
        : colors.dotConnectedLow;
  }
}

export class DisplayOutputHandler extends OutputHandler {
  textEle: HTMLElement;
  inCount: number;
  constructor(inCount: number) {
    super(document.createElement("div"), inCount);
    this.inCount = inCount;
    this.ele.style.width = (dimensions.output.width * 3) + "px";
    this.ele.classList.add("IODisplay");
    this.textEle = document.createElement("h1");
    this.textEle.innerHTML = "0";
    this.ele.appendChild(this.textEle);
  }
  handleUpdate(values: boolean[]): void {
    if (values.length != this.inCount)
      throw "Invalid values length";
    let decimal = 0;
    for (let i = 0, x = 1; i < values.length; i++, x *= 2)
      if (values[i]) decimal += x;
    this.textEle.innerHTML = String(decimal);
  }
}
