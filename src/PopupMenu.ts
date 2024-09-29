export default class PopupMenu {
  static instance: PopupMenu | null = null;
  ele: HTMLElement;
  constructor(x: number, y: number, options: string[], callback: Function) {
    if (PopupMenu.instance) PopupMenu.instance.remove();
    PopupMenu.instance = this;

    this.ele = document.createElement("div");
    this.ele.addEventListener("contextmenu", (e) => e.preventDefault());
    this.ele.classList.add("popup");
    for (const opt of options) {
      const p = document.createElement("p");
      p.innerText = opt;
      p.addEventListener("click", (e) => {
        e.stopPropagation();
        this.remove();
        callback(opt);
      });
      this.ele.appendChild(p);
      this.ele.style.top = y + "px";
      this.ele.style.left = x + "px";
    }
  }
  remove() {
    PopupMenu.instance = null;
    this.ele.remove();
    console.log("deleted");
  }
  render(parentEle: HTMLElement) {
    console.log("added", this.ele)
    parentEle.appendChild(this.ele);
  }
}
