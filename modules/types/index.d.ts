import type { Decoder, DecoderResult } from "@inspector-hex/api";

export type PotentialDecoder = (...args: Parameters<Decoder>) => unknown;

export type DataMessage<T extends string, D = undefined> = D extends undefined
	? { type: T; }
	: { type: T; data: D extends object ? Readonly<D> : D; };

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
