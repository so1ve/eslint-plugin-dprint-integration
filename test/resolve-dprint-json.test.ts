import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { describe, expect, it } from "vitest";

import { resolveDprintJson } from "../src/resolve-dprint-json";

const dir = dirname(fileURLToPath(import.meta.url));
const resolveByRelativePath = (relativePath: string) => resolveDprintJson(join(dir, relativePath));

describe("should", () => {
  it("resolve", () => {
    expect(resolveByRelativePath("./__fixtures__/a.json")).toEqual({
      globalConfig: {
        a: "foo",
      },
      pluginConfig: {},
    });
  });
  it("resolve nested extends", () => {
    expect(resolveByRelativePath("./__fixtures__/dprint.json")).toEqual({
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
