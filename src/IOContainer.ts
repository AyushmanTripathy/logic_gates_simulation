import { colors, dimensions } from "./config";
import { select } from "./utils";

function createIODot(): HTMLElement {
  const dot = document.createElement("div");
  dot.classList.add("dot");
  return dot;
}

function matchPos(a: HTMLElement, b: HTMLElement, isInput: boolean) {
  a.style.top = b.style.top;
  const brect = b.getBoundingClientRect();
  if (isInput) a.style.left = (brect.x - a.getBoundingClientRect().width) + "px";
  else a.style.left = (brect.x + brect.width) + "px";
}

function bindWith(a: HTMLElement, b: HTMLElement, isInput: boolean) {
  matchPos(a, b, isInput);
  b.addEventListener("dragend", () => matchPos(a, b, isInput));
}

type InputHandlerCallback = (i: number, v: boolean) => void;
export interface InputHandler {
  bind(boxEle: HTMLElement): void;
  render(parentEle: HTMLElement): void;
}

export class SimpleInputHandler implements InputHandler {
  dots: HTMLElement[] = [];
  ele: HTMLElement;
  inputIOValues: boolean[];
  callback: Function;

  constructor(inputIOValues: boolean[], callback: InputHandlerCallback) {
    this.inputIOValues = inputIOValues;
    this.callback = callback;

    this.ele = document.createElement("div");
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

  bind(boxEle: HTMLElement) {
    bindWith(this.ele, boxEle, true);
  }

  render(parentEle: HTMLElement) {
    parentEle.appendChild(this.ele);
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

export class OutputIOContainer {
  dots: HTMLElement[] = [];
  outCount: number;
  constructor(ele: HTMLElement, count: number) {
    const outputBoxEle = select(".outputGate");
    outputBoxEle.classList.add("IOBox");
    bindWith(ele, outputBoxEle, false);

    ele.style.height = dimensions.output.height + "px";
    ele.style.width = dimensions.output.width + "px";
    this.outCount = count;
    for (let i = 0; i < count; i++) {
      const d = createIODot();
      d.style.backgroundColor = colors.dotConnectedLow;
      this.dots.push(d);
      ele.appendChild(d);
    }
  }

  update(values: boolean[]) {
    for (let i = 0; i < this.outCount; i++)
      this.dots[i].style.backgroundColor = values[i]
        ? colors.dotConnectedHigh
        : colors.dotConnectedLow;
  }
}
