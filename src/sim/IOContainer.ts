import { colors, dimensions } from "../config";

function createIODot(): HTMLElement {
  const dot = document.createElement("div");
  dot.classList.add("dot");
  return dot;
}

export class InputIOContainer {
  dots: HTMLElement[] = [];
  inputIOValues: boolean[];
  callback: Function;
  constructor(ele: HTMLElement, inputIOValues: boolean[], callback: Function) {
    this.inputIOValues = inputIOValues;
    this.callback = callback;

    ele.style.height = dimensions.input.height + "px";
    ele.style.width = dimensions.input.width + "px";

    for (let i = 0; i < inputIOValues.length; i++) {
      const d = createIODot();
      this.dots.push(d);
      d.style.backgroundColor = colors.dotConnectedLow;
      d.onclick = () => this.updateInput(i, !this.inputIOValues[i]);
      ele.appendChild(d);
    }
  }

  updateInput(index: number, val: boolean) {
    if (index < 0 || index >= this.dots.length)
      throw "invalid index " + index;
    this.dots[index].style.backgroundColor = val ? colors.dotConnectedHigh : colors.dotConnectedLow;
    this.inputIOValues[index] = val;
    this.callback(index, val);
  }
}

export class OutputIOContainer {
  dots: HTMLElement[] = [];
  outCount: number;
  constructor(ele: HTMLElement, count: number) {
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
