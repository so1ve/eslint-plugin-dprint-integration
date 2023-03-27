import * as fs from "node:fs";
import { extname } from "node:path";

import { getBuffer as getDockerfileBuffer } from "@dprint/dockerfile";
import type { Formatter as DprintFormatter, GlobalConfiguration } from "@dprint/formatter";
import { createFromBuffer } from "@dprint/formatter";
import { getPath as getJsonPath } from "@dprint/json";
import { getPath as getMarkdownPath } from "@dprint/markdown";
import { getBuffer as getTomlBuffer } from "@dprint/toml";
import { getPath as getTypescriptPath } from "@dprint/typescript";

import type { PluginConfig } from "./types";

const createFormatter = (
  pathOrBuffer: string | ArrayBuffer,
  globalConfig: GlobalConfiguration = {},
  pluginConfig: Record<string, unknown> = {},
) => {
  const buffer = typeof pathOrBuffer === "string"
    ? fs.readFileSync(pathOrBuffer)
    : pathOrBuffer;
  const formatter = createFromBuffer(buffer);
  formatter.setConfig(globalConfig, pluginConfig);
  return formatter;
};

const TS_EXTS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".mts", ".cts"];
const JSON_EXTS = [".json", ".jsonc", ".json5"];
const MARKDOWN_EXTS = [".md", ".markdown", ".mdown", ".mkd"];

const detectLanguage = (filename: string) => {
  const ext = extname(filename);
  if (TS_EXTS.includes(ext)) { return "typescript"; }
  if (ext === ".toml") { return "toml"; }
  if (JSON_EXTS.includes(ext)) { return "json"; }
  if (MARKDOWN_EXTS.includes(ext)) { return "markdown"; }
  if (filename === "Dockerfile") { return "dockerfile"; }
};

export class Formatter {
  private readonly typescript: DprintFormatter;
  private readonly toml: DprintFormatter;
  private readonly json: DprintFormatter;
  private readonly markdown: DprintFormatter;
  private readonly dockerfile: DprintFormatter;
  constructor(
    globalConfig: GlobalConfiguration = {},
    pluginConfig: PluginConfig = {},
  ) {
    this.typescript = createFormatter(getTypescriptPath(), globalConfig, pluginConfig.typescript);
    this.toml = createFormatter(getTomlBuffer(), globalConfig, pluginConfig.toml);
    this.json = createFormatter(getJsonPath(), globalConfig, pluginConfig.json);
    this.markdown = createFormatter(getMarkdownPath(), globalConfig, pluginConfig.markdown);
    this.dockerfile = createFormatter(getDockerfileBuffer(), globalConfig, pluginConfig.dockerfile);
  }

  format(filename: string, source: string) {
    const language = detectLanguage(filename);
    if (!language) { return source; }
    switch (language) {
      case "typescript":
        return this.typescript.formatText(filename, source);
      case "toml":
        return this.toml.formatText(filename, source);
      case "json":
        return this.json.formatText(filename, source);
      case "markdown":
        return this.markdown.formatText(filename, source);
      case "dockerfile":
        return this.dockerfile.formatText(filename, source);
    }
  }
}
