export default class Notifier {
  ele: HTMLElement;
  timeoutId: number | null;
  constructor(ele: HTMLElement) {
    this.ele = ele;
    this.timeoutId = null;
    this.ele.addEventListener("click", () => this.hide())
  }
  display(msg: string) {
    this.ele.innerText = msg;
    this.ele.classList.remove("notificationHidden");
    if (this.timeoutId !== null)
      window.clearTimeout(this.timeoutId);
    this.timeoutId = window.setTimeout(() => this.hide(), 3000);
  }
  hide() {
    this.ele.classList.add("notificationHidden")
  }
}
