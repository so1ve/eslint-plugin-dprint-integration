import fs from "node:fs";
import path from "node:path";

import { getPath as getDockerfilePath } from "@dprint/dockerfile";
import type {
	Formatter as DprintFormatter,
	GlobalConfiguration,
} from "@dprint/formatter";
import { createFromBuffer } from "@dprint/formatter";
import { getPath as getJsonPath } from "@dprint/json";
import { getPath as getMarkdownPath } from "@dprint/markdown";
import { getPath as getTomlBuffer } from "@dprint/toml";
import { getPath as getTypescriptPath } from "@dprint/typescript";

import type { PluginConfig } from "./types";
import { detectLanguage, hasNewlineOnly } from "./utils";

function createFormatter(
	pathOrBuffer: string | ArrayBuffer,
	globalConfig: GlobalConfiguration = {},
	pluginConfig = {},
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
			getDockerfilePath(),
			globalConfig,
			pluginConfig.dockerfile,
		);
		this.malva = createFormatter(
			path.join(
				path.dirname(require.resolve("dprint-plugin-malva")),
				"./plugin.wasm",
			),
			globalConfig,
			pluginConfig.malva,
		);
		this.markup = createFormatter(
			path.join(
				path.dirname(require.resolve("dprint-plugin-markup/package.json")),
				"./plugin.wasm",
			),
			globalConfig,
			pluginConfig.markup,
		);
	}

	public format(filePath: string, fileText: string) {
		const language = detectLanguage(filePath);
		if (!language) {
			return fileText;
		}
		// Special Handle: If the source is only a newline, don't format it, or it will break the file.
		if (language === "typescript" && hasNewlineOnly(fileText)) {
			return fileText;
		}
		switch (language) {
			case "typescript": {
				return this.typescript.formatText({
					filePath,
					fileText,
				});
			}
			case "toml": {
				return this.toml.formatText({
					filePath,
					fileText,
				});
			}
			case "json": {
				return this.json.formatText({
					filePath,
					fileText,
				});
			}
			case "markdown": {
				return this.markdown.formatText({
					filePath,
					fileText,
				});
			}
			case "dockerfile": {
				return this.dockerfile.formatText({
					filePath,
					fileText,
				});
			}
			case "malva": {
				return this.malva.formatText({
					filePath,
					fileText,
				});
			}
			case "markup": {
				return this.markup.formatText({
					filePath,
					fileText,
				});
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
