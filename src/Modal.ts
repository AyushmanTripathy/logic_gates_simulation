interface Message {
  title: string;
  msg: string;
  btns: [{ name: string; callback: Function }];
}

export default class Modal {
  ele: HTMLDialogElement;
  isOpen: boolean = false;
  constructor(ele: HTMLDialogElement) {
    this.ele = ele;
  }
  close() {
    this.ele.close();
    this.ele.innerHTML = "";
    this.isOpen = false;
  }
  showMessage(msg: Message) {
    if (this.isOpen) throw "already open";
    this.isOpen = true;
    const create = (tag: string, val: string) => {
      const e = document.createElement(tag);
      e.innerText = val;
      this.ele.appendChild(e);
      return e;
    };
    create("h2", msg.title);
    create("p", msg.msg);
    for (const btn of msg.btns)
      create("button", btn.name).onclick = () => {
        this.close();
        btn.callback();
      };
    this.ele.showModal();
  }
}
