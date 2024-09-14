export function select<T extends Element = HTMLElement>(query: string): T {
  const ele = document.querySelector<T>(query);
  if (!ele) throw "element not found for " + query;
  return ele;
}

export async function loadContent(filename: string) {
  const data = await fetch("/content/" + filename + ".json");
  return await data.json();
}
