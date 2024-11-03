// @ts-check
/// <reference path="./eslint-typegen.d.ts" />

import pluginShigen from "@shigen/eslint-plugin";
import pluginStylistic from "@stylistic/eslint-plugin";
import pluginUnusedImports from "eslint-plugin-unused-imports";
import typegen from "eslint-typegen";
import tseslint from "typescript-eslint";

export default typegen([
	{
		ignores: [ "**/dist/**/*", ],
	},
	{
		files: [ "**/*.?(c|m)@(j|t)s", ],
		plugins: {
			"stylistic": pluginStylistic,
			"shigen": pluginShigen,
			"unused-imports": pluginUnusedImports,
		},
		rules: {
			"shigen/group-imports": [ "error", "*.css", { class: "node", }, { class: "external", }, { class: "relative", }, ],
			"shigen/sort-imports": [ "error", { inlineTypes: "end", }, ],
			"stylistic/quotes": [ "error", "double", { allowTemplateLiterals: true, }, ],
			"stylistic/quote-props": [ "error", "consistent-as-needed", ],
			"stylistic/semi": [ "error", "always", ],
			"stylistic/semi-style": [ "error", "last", ],
			"stylistic/semi-spacing": [ "error", { before: false, after: true, }, ],
			"stylistic/comma-dangle": [ "error", {
				arrays: "always",
				objects: "always",
				imports: "always-multiline",
				exports: "always-multiline",
				functions: "always-multiline",
			}, ],
			"stylistic/comma-spacing": [ "error", { before: false, after: true, }, ],
			"stylistic/array-bracket-spacing": [ "error", "always", ],
			"stylistic/object-curly-spacing": [ "error", "always", ],
			"unused-imports/no-unused-imports": [ "error", ],
		},
	},
	{
		files: [ "**/*.?(c|m)ts", ],
		languageOptions: {
			// @ts-ignore
			parser: tseslint.parser,
			parserOptions: {
				project: [
					"modules/api/tsconfig.json",
					"modules/editor/tsconfig.json",
					"modules/extension/tsconfig.json",
				],
			},
		},
		plugins: {
			// @ts-ignore
			ts: tseslint.plugin,
		},
		rules: {
			"stylistic/member-delimiter-style": [ "error", { singleline: { requireLast: true, }, }, ],
			"ts/adjacent-overload-signatures": [ "error", ],
			"ts/no-import-type-side-effects": [ "error", ],
			"ts/no-duplicate-type-constituents": [ "error", ],
			"ts/no-implied-eval": [ "error", ],
			"ts/no-non-null-asserted-nullish-coalescing": [ "error", ],
			"ts/no-non-null-asserted-optional-chain": [ "error", ],
			"ts/no-shadow": [ "error", ],
			"ts/no-unnecessary-template-expression": [ "error", ],
			"ts/no-unsafe-argument": [ "error", ],
			"ts/no-unsafe-call": [ "error", ],
			"ts/no-unsafe-member-access": [ "error", ],
			"ts/no-unsafe-declaration-merging": [ "error", ],
			"ts/no-unsafe-unary-minus": [ "error", ],
			"ts/consistent-type-imports": [ "error", { fixStyle: "inline-type-imports", }, ],
		},
	},
]);
