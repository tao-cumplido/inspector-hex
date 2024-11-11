import { window, workspace, type Uri } from "vscode";

import { AbstractDocument } from "./abstract-document";

export class BinaryDocument extends AbstractDocument<undefined> {
	static async create(uri: Uri): Promise<BinaryDocument> {
		const { size, } = await workspace.fs.stat(uri);

		if (size > 10 * 2 ** 20) {
			const units = [ "byte", "kilobyte", "megabyte", "gigabyte", "terabyte", "petabyte", ];
			const index = Math.max(0, Math.min(Math.floor(Math.log10(size) / 3), units.length - 1));
			const value = parseFloat((size / 1000 ** index).toPrecision(3));
			const bytesFormatter = new Intl.NumberFormat("en-US", { style: "unit", unit: units[index], unitDisplay: "short", });

			const warningResult = await window.showWarningMessage(
				`Virtual workspaces don't support reading files partially. Opening this file would load ${bytesFormatter.format(
					value,
				)} into memory.`,
				{ modal: true, },
				{ title: "Cancel", isCloseAffordance: true, },
				{ title: "Load anyway", },
			);

			if (warningResult?.isCloseAffordance) {
				return new BinaryDocument(uri, new Uint8Array());
			}
		}

		return new BinaryDocument(uri, await workspace.fs.readFile(uri));
	}

	readonly data;

	private constructor(uri: Uri, data: Uint8Array) {
		super(uri, data.byteLength, undefined);
		this.data = data;
	}

	read(offset: number, byteLength: number): Uint8Array {
		return this.data.subarray(offset, offset + byteLength);
	}
}
