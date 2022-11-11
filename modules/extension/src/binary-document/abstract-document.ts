import type { FileHandle } from 'fs/promises';

import type { CustomDocument, Uri } from 'vscode';
import { window, workspace } from 'vscode';

import type { DecoderResult, DecoderState, PotentialDecoder } from '@hex/types';
import { isDecoderResult } from '@hex/types';

import { output } from '../output';
import { state } from '../state';

export abstract class AbstractDocument<T extends FileHandle | undefined> implements CustomDocument {
	readonly uri;
	readonly byteLength;
	readonly fileHandle: T;

	constructor(uri: Uri, byteLength: number, fileHandle: T) {
		this.uri = uri;
		this.byteLength = byteLength;
		this.fileHandle = fileHandle;
	}

	abstract read(offset: number, byteLength: number): Uint8Array | Promise<Uint8Array>;

	async decodeWith(decoder: PotentialDecoder, offset: number, data: Uint8Array): Promise<DecoderResult | null> {
		if (!data.length) {
			return null;
		}

		try {
			const result = await decoder(data, {
				offset,
				file: {
					byteLength: this.byteLength,
					uri: this.uri.toString(),
					handle: this.fileHandle as FileHandle,
				},
				settings: workspace.getConfiguration('inspectorHex.decode') as unknown as DecoderState['settings'],
			});

			if (!isDecoderResult(result)) {
				// eslint-disable-next-line @typescript-eslint/no-floating-promises
				window.showErrorMessage(`Invalid decoder result.`);
				return null;
			}

			return result;
		} catch (error) {
			// eslint-disable-next-line @typescript-eslint/no-floating-promises
			window.showErrorMessage(`Error while decoding data. See output for details.`);
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			output.appendLine(`${error}\n`);
			if (error instanceof Error && error.stack) {
				output.appendLine(error.stack);
			}
			return null;
		}
	}

	dispose() {
		if (state.activeView?.document === this) {
			state.visibleViews.delete(state.activeView);
			state.activeDecoderStatusItem.hide();
			state.activeView = null;
		}

		const thisView = [...state.allViews].find(({ document }) => document === this);

		if (thisView) {
			state.allViews.delete(thisView);
		}
	}
}
