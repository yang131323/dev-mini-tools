import process from "node:process";
import fs from "node:fs";
import url from "node:url";
import path from "node:path";

const dir = path.dirname(url.fileURLToPath(import.meta.url));
const templateDirs = path.join(dir, "../templates");
const defaultTemplate = "index.html";

const args = new Map();
parseArgs();

function parseArgs() {
  const args = process.argv.slice(2);
  if (!args.length) return;
  for (const arg of args) {
    const [key, value] = arg.split("=");
    const keyStr = key.trim();
    if (args.has(keyStr)) console.log(`[${keyStr}] already exists`);
    args.set(keyStr, value.trim());
  }
}

function readFile(filepath, encoding = "utf8") {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, encoding, (error, data) => {
      if (error) reject(error);
      resolve(data);
    });
  });
}

async function readTemplate(name = defaultTemplate) {
  const templatePath = path.join(templateDirs, name);
  try {
    const data = await readFile(templatePath);
    return data;
  } catch (error) {
    console.error(`Template not found: ${name}`);
  }
}

async function run() {
  const name = args.get("name");
  if (!name) throw new Error("Missing name argument");
}

run();