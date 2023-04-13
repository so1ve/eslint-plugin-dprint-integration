import { readFileSync } from "node:fs";
import { extname } from "node:path";

const TS_EXTS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".mts", ".cts"];
const JSON_EXTS = [".json", ".jsonc", ".json5"];
const MARKDOWN_EXTS = [".md", ".markdown", ".mdown", ".mkd"];

export function detectLanguage(filename: string) {
  const ext = extname(filename);
  if (TS_EXTS.includes(ext)) { return "typescript"; }
  if (ext === ".toml") { return "toml"; }
  if (JSON_EXTS.includes(ext)) { return "json"; }
  if (MARKDOWN_EXTS.includes(ext)) { return "markdown"; }
  if (filename === "Dockerfile") { return "dockerfile"; }
}

export const hasNewlineOnly = (str: string) => ["\r", "\n", "\r\n"].includes(str);

export function pick<T extends Record<string, any>, K extends keyof T>(obj: T, pickKeys: K[] | readonly K[]) {
  const result = {} as Pick<T, K>;
  pickKeys.forEach((key) => {
    if (obj[key] !== undefined) { result[key] = obj[key]; }
  });
  return result;
}

export function omit<T extends object, K extends keyof T>(obj: T, omitKeys: K[] | readonly K[]) {
  const result = {} as Omit<T, K>;
  const keys = Object.keys(obj).filter((item) => !omitKeys.includes(item as K)) as Exclude<keyof T, K>[];
  keys.forEach((key) => {
    if (obj[key] !== undefined) { result[key] = obj[key]; }
  });
  return result;
}

export const readJson = (filename: string) => JSON.parse(readFileSync(filename, "utf8"));
