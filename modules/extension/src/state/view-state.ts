import type { Event, Webview } from 'vscode';

import type { ClientMessage, ClientMessageMap, HostMessage } from '@hex/types';

import type { BinaryDocument } from '../binary-document';
import type { DecoderItem } from '../decoders';

interface TypedWebview<R, P> extends Webview {
	readonly onDidReceiveMessage: Event<R>;
	readonly postMessage: (message: P) => Promise<boolean>;
}

export class ViewState {
	private offset = 0;
	private buffer = new Uint8Array();

	readonly webview: TypedWebview<ClientMessage, HostMessage>;
	readonly document: BinaryDocument;

	decoderItem: DecoderItem;

	constructor(webview: Webview, document: BinaryDocument, decoderItem: DecoderItem) {
		// @ts-expect-error
		this.webview = webview;
		this.document = document;
		this.decoderItem = decoderItem;

		webview.onDidReceiveMessage(async (message: ClientMessage) => {
			switch (message.type) {
				case 'ready':
					return this.handleReady();
				case 'fetchBytes':
					return this.handleFetchBytes(message.data);
				case 'fetchText':
					return this.handleFetchText();
			}
		});
	}

	async handleReady(): Promise<unknown> {
		return this.webview.postMessage({
			type: 'stat',
			data: {
				fileSize: this.document.byteLength,
			},
		});
	}

	async handleFetchBytes({ offset, byteLength }: ClientMessageMap['fetchBytes']): Promise<void> {
		this.offset = offset;
		this.buffer = await this.document.read(offset, byteLength);

		await this.webview.postMessage({
			type: 'bytes',
			data: { offset, buffer: this.buffer.buffer.slice(this.buffer.byteOffset, this.buffer.byteLength) },
		});
	}

	async prepareText(): Promise<void> {
		await this.webview.postMessage({
			type: 'prepareText',
		});

		await this.handleFetchText();
	}

	async handleFetchText(): Promise<void> {
		await this.webview.postMessage({
			type: 'text',
			data: await this.document.decodeWith(this.decoderItem.decoder, this.offset, this.buffer),
		});
	}

	async goToOffset(offset: number): Promise<void> {
		await this.webview.postMessage({
			type: 'goTo',
			data: offset,
		});
	}
}
