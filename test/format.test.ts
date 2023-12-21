import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { Linter } from "eslint";
import * as parserPlain from "eslint-parser-plain";
import fg from "fast-glob";
import { describe, expect, it } from "vitest";

import DprintIntegration from "../src";
import { dir } from "./utils";

const dirname = dir();
const relative = (path: string) => join(dirname, path);

const linter = new Linter();
const linterConfig = {
	parser: "plain",
	rules: {
		dprint: "error",
	},
} satisfies Linter.Config;

linter.defineParser("plain", parserPlain as any);
linter.defineRule("dprint", DprintIntegration.rules.dprint);

async function runFixtures(fixtures: string) {
	const fixtureFileList = await fg(fixtures.replaceAll("\\", "/"));
	const fixtureFiles = await Promise.all(
		fixtureFileList.map(async (file) => {
			const source = await readFile(file, { encoding: "utf-8" });

			return {
				file,
				source,
			};
		}),
	);

	const results = fixtureFiles.map(({ file, source }) => {
		const { output } = linter.verifyAndFix(source, linterConfig, file);

		return {
			file,
			output,
		};
	});

	return results;
}

describe("format", async () => {
	const results = await runFixtures(relative("./__fixtures__/format/**"));

	for (const { file, output } of results) {
		it(`File: ${file}`, async () => {
			expect(output).toMatchSnapshot();
		});
	}
});
