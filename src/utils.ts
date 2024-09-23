export function select<T extends Element = HTMLElement>(query: string): T {
  const ele = document.querySelector<T>(query);
  if (!ele) throw "Query failed " + query;
  return ele;
}
