import { dirname, join } from "node:path";

import findup from "find-up";
import { defu } from "defu";

import { omit, pick, readJson } from "./utils";

const DPRINT_JSON_FILES = ["dprint.json", ".dprint.json"] as const;
const DPRINT_PLUGINS_BUILTIN = ["typescript", "toml", "json", "markdown", "dockerfile"] as const;

interface DprintJson {
  globalConfig: Record<string, any>;
  pluginConfig: Record<string, any>;
}

// Resolves dprint.json file
// Implemented outside the dprint core since the js formatter API does not expose the resolveConfig function
export function resolveDprintJson(path?: string, lastPath?: string): DprintJson | undefined {
  if (path === lastPath && path) {
    throw new Error(`Circular extends in ${path}`);
  }
  const dprintJsonFile = path ?? findup.sync(DPRINT_JSON_FILES);
  if (!dprintJsonFile) {
    return undefined;
  }
  const dprintJson = readJson(dprintJsonFile);
  const globalConfig = omit(dprintJson, DPRINT_PLUGINS_BUILTIN);
  const pluginConfig = pick(dprintJson, DPRINT_PLUGINS_BUILTIN);
  const dprintConfig = { globalConfig: omit(globalConfig, ["extends"]), pluginConfig };
  if (globalConfig.extends) {
    const filesToBeExtended = Array.isArray(globalConfig.extends) ? globalConfig.extends : [globalConfig.extends];
    const extendsConfig = filesToBeExtended.reduce((acc, fileToBeExtended) => {
      const extendedConfig = resolveDprintJson(join(dirname(dprintJsonFile), fileToBeExtended), path);
      if (!extendedConfig) {
        return acc;
      }
      return defu(acc, extendedConfig);
    }, {});
    if (extendsConfig) {
      return defu(dprintConfig, extendsConfig);
    }
  }
  return dprintConfig;
}
