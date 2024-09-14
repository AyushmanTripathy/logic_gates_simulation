import { colors, dimensions } from "../config";

function createIODot(): HTMLElement {
  const dot = document.createElement("div");
  dot.classList.add("dot");
  return dot;
}

export class InputIOContainer {
  constructor(ele: HTMLElement, inputIOValues: boolean[], callback: Function) {
    ele.style.height = dimensions.input.height + "px";
    ele.style.width = dimensions.input.width + "px";

    for (let i = 0; i < inputIOValues.length; i++) {
      const d = createIODot();
      d.style.backgroundColor = colors.dotConnectedLow;
      d.onclick = () => {
        inputIOValues[i] = !inputIOValues[i];
        d.style.backgroundColor = inputIOValues[i]
          ? colors.dotConnectedHigh
          : colors.dotConnectedLow;
        callback(i, inputIOValues[i]);
      };
      ele.appendChild(d);
    }
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
