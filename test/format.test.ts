import { Linter } from "eslint";
import * as parserPlain from "eslint-parser-plain";
import { describe, expect, it } from "vitest";

import DprintIntegration from "../src";

const linter = new Linter();
const linterConfig = {
	parser: "plain",
	rules: {
		dprint: "error",
	},
} satisfies Linter.Config;

linter.defineParser("plain", parserPlain as any);
linter.defineRule("dprint", DprintIntegration.rules.dprint);

describe("format", async () => {
	const fixtureFiles = import.meta.glob("./__fixtures__/format/**", {
		eager: true,
		as: "raw",
	});

	const results = Object.entries(fixtureFiles).map(([file, source]) => {
		const { output } = linter.verifyAndFix(source, linterConfig, file);

		return {
			file,
			output,
		};
	});

	for (const { file, output } of results) {
		it(`File: ${file}`, async () => {
			expect(output).toMatchSnapshot();
		});
	}
});
