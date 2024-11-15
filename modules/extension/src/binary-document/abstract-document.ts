import type { FileHandle } from "node:fs/promises";

import type { PotentialDecoder } from "@hex/types";
import { isDecoderResult, type DecoderResult, type DecoderState } from "@inspector-hex/api";
import { window, workspace, type CustomDocument, type Uri } from "vscode";

import { output } from "../output";
import { DocumentView, SelectedDecoderStatusItem } from "../state";

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
				settings: workspace.getConfiguration("inspectorHex.decode") as unknown as DecoderState["settings"],
			});

			if (!isDecoderResult(result)) {
				window.showErrorMessage(`Invalid decoder result.`);
				return null;
			}

			return result;
		} catch (error) {
			window.showErrorMessage(`Error while decoding data. See output for details.`);
			output.appendLine(`${error}\n`);
			if (error instanceof Error && error.stack) {
				output.appendLine(error.stack);
			}
			return null;
		}
	}

	dispose() {
		if (DocumentView.active?.document === this) {
			DocumentView.visible.delete(DocumentView.active);
			SelectedDecoderStatusItem.hide();
			DocumentView.active = null;
		}

		const thisView = [ ...DocumentView.all, ].find(({ document, }) => document === this);

		if (thisView) {
			DocumentView.all.delete(thisView);
		}
	}
}
