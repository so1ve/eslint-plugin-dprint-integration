import { extname } from "node:path";

const TS_EXTS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".mts", ".cts"];
const JSON_EXTS = [".json", ".jsonc", ".json5"];
const MARKDOWN_EXTS = [".md", ".markdown", ".mdown", ".mkd"];

export const detectLanguage = (filename: string) => {
  const ext = extname(filename);
  if (TS_EXTS.includes(ext)) { return "typescript"; }
  if (ext === ".toml") { return "toml"; }
  if (JSON_EXTS.includes(ext)) { return "json"; }
  if (MARKDOWN_EXTS.includes(ext)) { return "markdown"; }
  if (filename === "Dockerfile") { return "dockerfile"; }
};

export const hasNewlineOnly = (str: string) => ["\r", "\n", "\r\n"].includes(str);
