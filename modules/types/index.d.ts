/* eslint-disable @typescript-eslint/consistent-type-imports */

import type { FileHandle } from 'fs/promises';

import type { FromSchema } from 'json-schema-to-ts';

type Schemas = typeof import('./schema').schemas;

type Module = {
	// @ts-expect-error
	[P in keyof Schemas as `is${Capitalize<P>}`]: (value: unknown) => value is FromSchema<Schemas[P]>;
};

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

	export type PotentialDecoder = (...args: Parameters<Decoder>) => unknown;

	export type DataMessage<T extends string, D = undefined> = D extends undefined
		? { type: T }
		: { type: T; data: D extends object ? Readonly<D> : D };

	type Messages<T> = { [P in keyof T]: P extends string ? DataMessage<P, T[P]> : never }[keyof T];

	export interface ClientMessageMap {
		ready: undefined;
		fetchBytes: {
			offset: number;
			byteLength: number;
		};
		fetchText: undefined;
	}

	export type ClientMessage = Messages<ClientMessageMap>;

	export interface HostMessageMap {
		stat: {
			fileSize: number;
		};
		bytes: {
			offset: number;
			buffer: ArrayBuffer;
		};
		prepareText: undefined;
		text: DecoderResult | null;
		goTo: number;
	}

	export type HostMessage = Messages<HostMessageMap>;
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
declare const module: Module;

export = module;
