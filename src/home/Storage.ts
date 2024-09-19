export class ProgressStorage {
  static hasInstance = false;
  static key = "ProgressStorage";
  data: boolean[][];
  unitCompleted: boolean[];
  constructor(levelCounts: number[]) {
    const data = localStorage.getItem(ProgressStorage.key);
    if (data) {
      this.data = JSON.parse(data);
      this.unitCompleted = this.data.map((x) => !x.includes(false));
    } else {
      this.data = [];
      for (const unitLength of levelCounts)
        this.data.push(new Array(unitLength).fill(false));
      this.unitCompleted = new Array(levelCounts.length).fill(false);
      this.saveData();
    }
  }

  saveData() {
    localStorage.setItem(ProgressStorage.key, JSON.stringify(this.data));
  }

  checkUnitIndex(ui: number) {
    if (ui < 0 || ui >= this.unitCompleted.length)
      throw "Invalid unit index " + ui;
  }

  checkLeveLIndex(ui: number, li: number) {
    this.checkUnitIndex(ui);
    if (li < 0 || li >= this.data[ui].length) throw "Invalid level index " + li;
  }

  markLevelComplete(ui: number, li: number) {
    this.checkLeveLIndex(ui, li);

    if (this.data[ui][li]) throw "Already completed";
    this.data[ui][li] = true;
    this.unitCompleted[ui] = !this.data[ui].includes(false);
    this.saveData();
  }

  checkUnitStatus(ui: number): [boolean, number, number] {
    this.checkUnitIndex(ui);
    const total = this.data[ui].length;
    let done = 0;
    for (const level of this.data[ui]) {
      if (level) done++;
    }
    return [total == done, done, total];
  }

  checkLevelStatus(ui: number, li: number): boolean {
    this.checkLeveLIndex(ui, li);
    return this.data[ui][li];
  }
}
