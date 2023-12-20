import fs from "node:fs";
import path from "node:path";

import { getBuffer as getDockerfileBuffer } from "@dprint/dockerfile";
import type {
	Formatter as DprintFormatter,
	GlobalConfiguration,
} from "@dprint/formatter";
import { createFromBuffer } from "@dprint/formatter";
import { getPath as getJsonPath } from "@dprint/json";
import { getPath as getMarkdownPath } from "@dprint/markdown";
import { getBuffer as getTomlBuffer } from "@dprint/toml";
import { getPath as getTypescriptPath } from "@dprint/typescript";

import type { PluginConfig } from "./types";
import { detectLanguage, hasNewlineOnly } from "./utils";

function createFormatter(
	pathOrBuffer: string | ArrayBuffer,
	globalConfig: GlobalConfiguration = {},
	pluginConfig: Record<string, unknown> = {},
) {
	const buffer =
		typeof pathOrBuffer === "string"
			? fs.readFileSync(pathOrBuffer)
			: pathOrBuffer;
	const formatter = createFromBuffer(buffer);
	formatter.setConfig(globalConfig, pluginConfig);

	return formatter;
}

export class Formatter {
	private readonly typescript: DprintFormatter;
	private readonly toml: DprintFormatter;
	private readonly json: DprintFormatter;
	private readonly markdown: DprintFormatter;
	private readonly dockerfile: DprintFormatter;
	private readonly malva: DprintFormatter;
	private readonly markup: DprintFormatter;
	constructor(
		globalConfig: GlobalConfiguration = {},
		pluginConfig: PluginConfig = {},
	) {
		this.typescript = createFormatter(
			getTypescriptPath(),
			globalConfig,
			pluginConfig.typescript,
		);
		this.toml = createFormatter(
			getTomlBuffer(),
			globalConfig,
			pluginConfig.toml,
		);
		this.json = createFormatter(getJsonPath(), globalConfig, pluginConfig.json);
		this.markdown = createFormatter(
			getMarkdownPath(),
			globalConfig,
			pluginConfig.markdown,
		);
		this.dockerfile = createFormatter(
			getDockerfileBuffer(),
			globalConfig,
			pluginConfig.dockerfile,
		);
		this.malva = createFormatter(
			path.join(
				path.dirname(require.resolve("dprint-plugin-malva")),
				"./plugin.wasm",
			),
			globalConfig,
			pluginConfig.malva as Record<string, unknown>,
		);
		this.markup = createFormatter(
			path.join(
				path.dirname(require.resolve("dprint-plugin-markup")),
				"./plugin.wasm",
			),
			globalConfig,
			pluginConfig.markup as Record<string, unknown>,
		);
	}

	public format(filename: string, source: string) {
		const language = detectLanguage(filename);
		if (!language) {
			return source;
		}
		// Special Handle: If the source is only a newline, don't format it, or it will break the file.
		if (language === "typescript" && hasNewlineOnly(source)) {
			return source;
		}
		switch (language) {
			case "typescript": {
				return this.typescript.formatText(filename, source);
			}
			case "toml": {
				return this.toml.formatText(filename, source);
			}
			case "json": {
				return this.json.formatText(filename, source);
			}
			case "markdown": {
				return this.markdown.formatText(filename, source);
			}
			case "dockerfile": {
				return this.dockerfile.formatText(filename, source);
			}
			case "malva": {
				return this.malva.formatText(filename, source);
			}
			case "markup": {
				return this.markup.formatText(filename, source);
			}
		}
	}

	public get configDiagnostics() {
		return [
			...this.typescript.getConfigDiagnostics(),
			...this.toml.getConfigDiagnostics(),
			...this.json.getConfigDiagnostics(),
			...this.markdown.getConfigDiagnostics(),
			...this.dockerfile.getConfigDiagnostics(),
			...this.malva.getConfigDiagnostics(),
			...this.markup.getConfigDiagnostics(),
		];
	}
}
