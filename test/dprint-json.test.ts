import { join } from "node:path";

import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

import { dir } from "./utils";

const dirname = dir();
const relative = (path: string) => join(dirname, path);

const eslint = new ESLint({
  baseConfig: {
    parserOptions: {
      ecmaVersion: "latest",
      ecmaFeatures: {
        jsx: true,
      },
      sourceType: "module",
    },
    plugins: ["dprint-integration"],
    rules: {
      "dprint-integration/dprint": [
        "error",
        { useDprintJson: relative("__fixtures__/dprint.json") },
      ],
    },
  },
  useEslintrc: false,
  ignore: false,
});

describe("dprint json config", () => {
  it("should resolve config", async () => {
    const result = await eslint.lintFiles(relative("./__fixtures__/dprint-json/**"));
    expect(result).toMatchSnapshot();
  });
});
