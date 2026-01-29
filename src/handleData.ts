import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { Bugs } from "./types.js";

async function dumpData(bugs: Bugs): Promise<void> {
  const path = resolve('data.json');
  try {
    const dataJSON = JSON.stringify(bugs);
    await writeFile(path, dataJSON);
    console.log("Data successfully dumped")
  } catch (err) {
    console.log("Data wasn't saved.")
  }
}

async function loadData(): Promise<Bugs> {
  const path = resolve('data.json');
  try {
    const data = await readFile(path, "utf8");
    console.log("Data successfully loaded");
    return JSON.parse(data);
  } catch (err) {
    console.log("Data wasn't loaded. Starting fresh.");
    return {};
  }
}

export { dumpData, loadData };