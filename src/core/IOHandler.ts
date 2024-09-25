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
export abstract class InputHandler {
  ele: HTMLElement;
  constructor(ele: HTMLElement) {
    this.ele = ele;
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
    const ele = document.createElement("div");
    super(ele);
    this.inputIOValues = inputIOValues;
    this.callback = callback;

    this.ele.classList.add("IOContainer");

    this.ele.style.height = dimensions.input.height + "px";
    this.ele.style.width = dimensions.input.width + "px";

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

export abstract class OutputHandler {
  ele: HTMLElement;
  constructor(ele: HTMLElement) {
    this.ele = ele;
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
    const ele = document.createElement("div");
    super(ele);
    this.inCount = inCount;
    ele.classList.add("IOContainer");
    ele.style.height = dimensions.input.height + "px";
    ele.style.width = dimensions.input.width + "px";

    for (let i = 0; i < inCount; i++) {
      const d = createIODot();
      d.style.backgroundColor = colors.dotConnectedLow;
      this.dots.push(d);
      this.ele.appendChild(d);
    }
  }

  handleUpdate(values: boolean[]): void {
    for (let i = 0; i < this.inCount; i++)
      this.dots[i].style.backgroundColor = values[i]
        ? colors.dotConnectedHigh
        : colors.dotConnectedLow;
  }
}
