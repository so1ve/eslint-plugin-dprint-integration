import { basename, extname } from "node:path";

import { defu } from "defu";
import type { ESLint, Rule } from "eslint";
import { generateDifferences, showInvisibles } from "prettier-linter-helpers";
import type { Difference } from "prettier-linter-helpers";

import disableConflict from "./disable-conflict";
import { Formatter } from "./format";
import { resolveDprintJson } from "./resolve-dprint-json";
import type { PluginConfig } from "./types";
import { getSvelteScriptTagOffset, omit } from "./utils";

const { INSERT, DELETE, REPLACE } = generateDifferences;
const VIRTUAL_EXTS = new Set([".vue"]);

function reportDifference(
  context: Rule.RuleContext,
  difference: Difference,
  rangeOffset = 0,
) {
  const { operation, offset, deleteText = "", insertText = "" } = difference;
  const range = [
    offset + rangeOffset,
    offset + rangeOffset + deleteText.length,
  ] as [number, number];
  const [start, end] = range.map((index) =>
    context.getSourceCode().getLocFromIndex(index),
  );

  context.report({
    messageId: operation,
    data: {
      deleteText: showInvisibles(deleteText),
      insertText: showInvisibles(insertText),
    },
    loc: { start, end },
    fix: (fixer) => fixer.replaceTextRange(range, insertText),
  });
}

function reportIf(
  context: Rule.RuleContext,
  source: string,
  formatted: string,
  offset = 0,
) {
  if (source !== formatted) {
    const differences = generateDifferences(source, formatted);
    for (const difference of differences) {
      reportDifference(context, difference, offset);
    }
  }
}

let formatter: Formatter;

export default {
  configs: {
    "recommended": {
      plugins: ["dprint-integration"],
      rules: {
        "dprint-integration/dprint": "error",
        "arrow-body-style": "off",
        "prefer-arrow-callback": "off",
      },
    },
    "disable-conflict": disableConflict,
  },
  rules: {
    dprint: {
      meta: {
        docs: {
          url: "https://github.com/so1ve/eslint-plugin-dprint-integration#options",
        },
        type: "layout",
        fixable: "code",
        schema: [
          // Global Config
          {
            type: "object",
            properties: {
              useDprintJson: {
                anyOf: [{ type: "boolean" }, { type: "string" }],
              },
            },
            additionalProperties: true,
          },
          // Plugin Config
          {
            type: "object",
            properties: {
              typescript: {
                type: "object",
                properties: {},
                additionalProperties: true,
              },
              toml: {
                type: "object",
                properties: {},
                additionalProperties: true,
              },
              json: {
                type: "object",
                properties: {},
                additionalProperties: true,
              },
              markdown: {
                type: "object",
                properties: {},
                additionalProperties: true,
              },
              dockerfile: {
                type: "object",
                properties: {},
                additionalProperties: true,
              },
              malva: {
                type: "object",
                properties: {},
                additionalProperties: true,
              },
              markup: {
                type: "object",
                properties: {},
                additionalProperties: true,
              },
            },
            additionalProperties: true,
          },
        ],
        messages: {
          [INSERT]: "Insert `{{ insertText }}`",
          [DELETE]: "Delete `{{ deleteText }}`",
          [REPLACE]: "Replace `{{ deleteText }}` with `{{ insertText }}`",
        },
      },
      create(context) {
        const useDprintJson = context.options[0]?.useDprintJson as
          | boolean
          | string
          | undefined;
        let globalConfig = omit(context.options[0] || {}, ["useDprintJson"]);
        let pluginConfig: PluginConfig = context.options[1] || {};
        if (useDprintJson) {
          const result = resolveDprintJson(
            typeof useDprintJson === "string" ? useDprintJson : undefined,
          );
          if (!result) {
            throw new Error(
              "`useDprintJson` is configured, but no dprint config found. Available config files: dprint.json, .dprint.json",
            );
          }
          const {
            globalConfig: dprintGlobalConfig,
            pluginConfig: dprintPluginConfig,
          } = result;
          globalConfig = defu(globalConfig, dprintGlobalConfig);
          pluginConfig = defu(pluginConfig, dprintPluginConfig);
        }
        if (!formatter) {
          formatter = new Formatter(globalConfig, pluginConfig);
        }
        const diagnostics = formatter.configDiagnostics;
        if (diagnostics.length > 0) {
          throw new Error(diagnostics.map((d) => d.message).join("\n"));
        }
        const sourceCode = context.getSourceCode();
        let filename = basename(context.getFilename());
        const ext = extname(filename);

        return {
          Program(node) {
            const offset = node.range?.[0];
            const source = sourceCode.getText(node);
            if (VIRTUAL_EXTS.has(ext)) {
              // Hack: Use .ts extension for scripts in vue files
              // Does not work for some strange languages such as coffeescript
              // Wait, you are using coffeescript?
              filename = "file.ts";
            }
            const formatted = formatter.format(filename, source);
            reportIf(context, source, formatted, offset);
          },
          // For eslint-plugin-svelte
          SvelteScriptElement(node: any) {
            let offset = node.range?.[0];
            const source = sourceCode.getText(node);
            const { offset: scriptOffset, scriptText } =
              getSvelteScriptTagOffset(source);
            offset += scriptOffset;
            filename = "file.ts";
            const formatted = formatter.format(filename, scriptText);
            reportIf(context, source, formatted, offset);
          },
        };
      },
    },
  },
} as ESLint.Plugin;
