export function select<T extends Element = HTMLElement>(query: string): T {
  const ele = document.querySelector<T>(query);
  if (!ele) throw "Query failed " + query;
  return ele;
}

export function randomHash(): string {
  let s = "";
  for (let i = 0; i < 10; i++) {
    s += String.fromCharCode(33 + Math.floor(Math.random() * 90));
  }
  return s;
}
