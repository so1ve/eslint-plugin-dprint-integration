import { basename, extname } from "node:path";

import type { ESLint, Rule } from "eslint";
import { generateDifferences, showInvisibles } from "prettier-linter-helpers";
import type { Difference } from "prettier-linter-helpers";

import disableConflict from "./disable-conflict";
import { Formatter } from "./format";
import type { PluginConfig } from "./types";

const { INSERT, DELETE, REPLACE } = generateDifferences;

function reportDifference (context: Rule.RuleContext, difference: Difference, rangeOffset = 0) {
  const { operation, offset, deleteText = "", insertText = "" } = difference;
  const range = [offset + rangeOffset, offset + rangeOffset + deleteText.length] as [number, number];
  const [start, end] = range.map(index => context.getSourceCode().getLocFromIndex(index));

  context.report({
    messageId: operation,
    data: {
      deleteText: showInvisibles(deleteText),
      insertText: showInvisibles(insertText),
    },
    loc: { start, end },
    fix: fixer => fixer.replaceTextRange(range, insertText),
  });
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
            properties: {},
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
        const globalConfig = context.options[0] || {};
        const pluginConfig: PluginConfig = context.options[1] || {};
        const sourceCode = context.getSourceCode();
        let filename = basename(context.getFilename());
        const ext = extname(filename);
        let source = sourceCode.text;
        if (!formatter) {
          formatter = new Formatter(globalConfig, pluginConfig);
        }

        return {
          Program(node) {
            let offset: number | undefined;
            // TODO: Support .vue files
            if (ext === ".vue") {
              source = sourceCode.getText(node);
              filename = "file.ts";
              offset = sourceCode.text.indexOf(source);
            }
            const formatted = formatter.format(filename, source);

            if (source !== formatted) {
              const differences = generateDifferences(source, formatted);
              for (const difference of differences) {
                reportDifference(context, difference, offset);
              }
            }
          },
        };
      },
    },
  },
} as ESLint.Plugin;
