import type { FileHandle } from 'fs/promises';

export type DecodedValue =
	| null
	| string
	| {
			readonly text?: string;
			readonly length?: number;
			readonly style?: {
				readonly color?: string;
			};
	  };

export interface DecoderResult {
	readonly offset: number;
	readonly values: readonly DecodedValue[];
}

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

export declare function isDecodedValue(value: unknown): value is DecodedValue;

export declare function isDecoderResult(value: unknown): value is DecoderResult;
