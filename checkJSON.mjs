import { readFileSync } from "fs";
import { logicGateFunctions } from "./src/logicGatesFunction.mjs";

const allowedFunctions = Object.keys(logicGateFunctions);

const levelFormat = {
  inCount: "number",
  outCount: "number",
  title: "string",
  description: "string",
  table: {
    labels: {
      inputs: "Array:string",
      outputs: "Array:string",
    },
    rows: {
      inputs: "Array:Array:number",
      outputs: "Array:Array:number",
    },
  },
  gates: "Array:string",
};

const unitFormat = {
  title: "string",
  levels: "Array:string",
};

const BASE = "public/content";

function error(expected, got) {
  console.log("expected ", expected);
  console.log("got ", got);
  console.log("\x1b[31m[FAILED]\x1b[0m");
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
      checkLevel(`${BASE}/${i}/${j}.json`);
  }
  console.log("\x1b[32m[PASSED]\x1b[0m");
}

function checkLevel(path) {
  console.log("checking ", path);
  const level = readJSON(path);
  checkFormat(level, levelFormat);

  for (const gate of level.gates) {
    if (!allowedFunctions.includes(gate)) error(allowedFunctions, gate);
  }

  const inputCount = level.table.labels.inputs.length;
  if (inputCount !== level.inCount)
    error(level.inCount + " input lables", inputCount);
  const outputCount = level.table.labels.outputs.length;
  if (outputCount !== level.outCount)
    error(level.outCount + " output labels", outputCount);
  const inputRowsCount = level.table.rows.inputs.length;
  const outputRowsCount = level.table.rows.outputs.length;
  if (inputRowsCount != outputRowsCount)
    error(inputRowsCount + " output rows", outputRowsCount);
  for (let i = 0; i < inputRowsCount; i++) {
    const input = level.table.rows.inputs[i];
    const output = level.table.rows.outputs[i];
    if (input.length !== inputCount)
      error(inputCount + " inputs", input);
    if (output.length !== outputCount)
      error(outputCount + " outputs", output);
  }
}

function checkFormat(item, format) {
  if (typeof format === "string") {
    if (format.startsWith("Array")) {
      if (Array.isArray(item))
        return checkArray(item, format.replace("Array:", ""));
      else error("Array", item);
    }
    if (typeof item !== format) error(format, item);
    return;
  }

  if (typeof item !== "object") error(format, item);

  for (const key in format) {
    if (!item.hasOwnProperty(key)) error(key, item);
    checkFormat(item[key], format[key]);
  }
}

function checkArray(arr, format) {
  for (const item of arr) {
    checkFormat(item, format);
  }
}
