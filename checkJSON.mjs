import { readFileSync } from "fs";
import { logicGateFunctions } from "./src/logicGatesFunction.mjs";

const allowedFunctions = Object.keys(logicGateFunctions);

const levelFormat = {
  inCount: "number",
  outCount: "number",
  title: "string",
  description: "string",
  table: {
    labels: "Array:string",
    rows: "Array:Array:number"
  },
  gates: "Array:string"
}

const unitFormat = {
  title: "string",
  levels: "Array:string"
}

const BASE = "public/content"

function error(expected, got) {
  console.log("expected ", expected);
  console.log("got ", got);
  console.log("\x1b[31m[FAILED]\x1b[0m")
  process.exit(0);
}

function readJSON(path) {
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch (e) {
    error(path, "no file");
    process.exit(0);
  }
}

checkUnits(BASE + "/units.json");
function checkUnits(path) {
  const units = readJSON(path);
  checkArray(units, unitFormat);
  for (let i = 0; i < units.length; i++) {
    for (let j = 0; j < units[i].levels.length; j++)
      checkLevel(`${BASE}/${i}/${j}.json`)
  }
  console.log("\x1b[32m[PASSED]\x1b[0m")
}

function checkLevel(path) {
  console.log("checking ", path);
  const level = readJSON(path);
  checkFormat(level, levelFormat);
  for (const gate of level.gates) {
    if (!allowedFunctions.includes(gate))
      error(allowedFunctions, gate);
  }
}

function checkFormat(item, format) {
  if (typeof format === "string") {
    if (format.startsWith("Array")) {
      if (Array.isArray(item))
        return checkArray(item, format.replace("Array:", ""));
      else error("Array", item);
    } 
    if (typeof item !== format)
      error(format, item);
    return;
  }

  if (typeof item !== "object")
    error(format, item);

  for (const key in format) {
    if (!item.hasOwnProperty(key)) error(key, item);
    checkFormat(item[key], format[key])
  }
}

function checkArray(arr, format) {
  for (const item of arr) {
    checkFormat(item, format);
  }
}
