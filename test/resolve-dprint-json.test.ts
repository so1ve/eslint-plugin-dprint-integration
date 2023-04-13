import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { resolveDprintJson } from "../src/resolve-dprint-json";

import { dir } from "./utils";

const dirname = dir();
const resolveByRelativePath = (relativePath: string) => resolveDprintJson(join(dirname, relativePath));

describe("resolve dprint json", () => {
  it("should resolve", () => {
    expect(resolveByRelativePath("./__fixtures__/resolve-dprint-json/d.json")).toEqual({
      globalConfig: {
        a: "foo",
      },
      pluginConfig: {},
    });
  });
  it("should resolve multiple and nested extends", () => {
    expect(resolveByRelativePath("./__fixtures__/resolve-dprint-json/a.json")).toEqual({
      globalConfig: { homo: 1919, b: "bar", lineWidth: 114514 },
      pluginConfig: {
        typescript: {
          "useBraces": "never",
          "quoteStyle": "alwaysSingle",
          "module.sortImportDeclarations": "maintain",
          "module.sortExportDeclarations": "maintain",
          "exportDeclaration.sortNamedExports": "maintain",
          "importDeclaration.sortNamedImports": "maintain",
        },
      },
    });
  });
});
