import type { Config as MalvaConfig } from "dprint-plugin-malva";
import type { Config as MarkupConfig } from "dprint-plugin-markup";

export interface PluginConfig {
	typescript?: Record<string, unknown>;
	toml?: Record<string, unknown>;
	json?: Record<string, unknown>;
	markdown?: Record<string, unknown>;
	dockerfile?: Record<string, unknown>;
	malva?: MalvaConfig;
	markup?: MarkupConfig;
}
