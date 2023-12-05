import { readFileSync } from "node:fs";
import { extname } from "node:path";

const TS_EXTS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".mts", ".cts"];
const JSON_EXTS = [".json", ".jsonc", ".json5"];
const MARKDOWN_EXTS = [".md", ".markdown", ".mdown", ".mkd"];
const MALVA_EXTS = [".css", ".scss", ".sass", ".less"];
const MARKUP_EXTS = [".html", ".vue", ".svelte", ".twig", ".jinja", ".jinja2"];

export function detectLanguage(filename: string) {
  const ext = extname(filename);
  if (TS_EXTS.includes(ext)) {
    return "typescript";
  }
  if (ext === ".toml") {
    return "toml";
  }
  if (JSON_EXTS.includes(ext)) {
    return "json";
  }
  if (MARKDOWN_EXTS.includes(ext)) {
    return "markdown";
  }
  if (filename === "Dockerfile") {
    return "dockerfile";
  }
  if (MALVA_EXTS.includes(ext)) {
    return "malva";
  }
  if (MARKUP_EXTS.includes(ext)) {
    return "markup";
  }
}

export const hasNewlineOnly = (str: string) =>
  ["\r", "\n", "\r\n"].includes(str);

export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  pickKeys: K[] | readonly K[],
) {
  const result = {} as Pick<T, K>;
  for (const key of pickKeys) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }

  return result;
}

export function omit<T extends object, K extends keyof T>(
  obj: T,
  omitKeys: K[] | readonly K[],
) {
  const result = {} as Omit<T, K>;
  const keys = Object.keys(obj).filter(
    (item) => !omitKeys.includes(item as K),
  ) as Exclude<keyof T, K>[];
  for (const key of keys) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }

  return result;
}

export const readJson = (filename: string) =>
  JSON.parse(readFileSync(filename, "utf8"));

export function getSvelteScriptTagOffset(source: string) {
  const startScriptTagRegex = /<script(\s[^>]*)?>/g;
  const endScriptTagRegex = /<\/script>/g;
  const offset = source.match(startScriptTagRegex)![0].length;
  const end = source.search(endScriptTagRegex);
  const scriptText = source.slice(offset, end);

  return { offset, scriptText };
}
