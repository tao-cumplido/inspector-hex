import type { FileHandle } from "node:fs/promises";

import { array, object, parse, union, type Infer, type Schema } from "tashikame";

export type DecodedValue = null | string | {
	readonly text?: string | undefined;
	readonly length?: number | undefined;
	readonly style?: {
		readonly color?: string | undefined;
	} | undefined;
};

export const DecodedValue: Schema<DecodedValue> = union([
	"null",
	"string",
	object({
		text: {
			optional: true,
			value: "string",
		},
		length: {
			optional: true,
			value: "number",
		},
		style: {
			optional: true,
			value: object({
				color: {
					optional: true,
					value: "string",
				},
			}, {
				looseOptionals: true,
			}),
		},
	}, {
		looseOptionals: true,
	}),
]);

export const DecoderResult = object({
	offset: {
		inferReadonly: true,
		value: "number",
	},
	values: {
		inferReadonly: true,
		value: array(DecodedValue, { inferReadonly: true, }),
	},
});

export type DecoderResult = Infer<typeof DecoderResult>;

export type RenderControlCharacters = "hex" | "abbreviation" | "escape" | "caret" | "picture";

export type DecoderState= {
	readonly offset: number;
	readonly file: {
		readonly byteLength: number;
		readonly uri: string;
		readonly handle: FileHandle;
	};
	readonly settings: {
		readonly renderControlCharacters: "off" | RenderControlCharacters | readonly RenderControlCharacters[];
	};
};

export type Decoder = (data: Uint8Array, state: DecoderState) => DecoderResult | Promise<DecoderResult>;

export const isDecodedValue = (value: unknown) => parse.is(DecodedValue, value);
export const isDecoderResult = (value: unknown) => parse.is(DecoderResult, value);
