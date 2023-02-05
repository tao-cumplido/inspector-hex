/* eslint-disable @typescript-eslint/consistent-type-imports */

import type { FileHandle } from 'fs/promises';

import type { FromSchema } from 'json-schema-to-ts';

type Schemas = typeof import('./schema').schemas;

type Module = {
	// @ts-expect-error
	[P in keyof Schemas as `is${Capitalize<P>}`]: (value: unknown) => value is FromSchema<Schemas[P]>;
};

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace module {
	export type DecoderResult = FromSchema<Schemas['decoderResult']>;

	export type RenderControlCharacters = 'hex' | 'abbreviation' | 'escape' | 'caret' | 'picture';

	export interface DecoderState {
		readonly offset: number;
		readonly file: {
			readonly byteLength: number;
			readonly uri: string;
			readonly handle: FileHandle;
		};
		readonly settings: {
			readonly renderControlCharacters: 'off' | RenderControlCharacters | RenderControlCharacters[];
		};
	}

	export type Decoder = (data: Uint8Array, state: DecoderState) => DecoderResult | Promise<DecoderResult>;
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
declare const module: Module;

export = module;
