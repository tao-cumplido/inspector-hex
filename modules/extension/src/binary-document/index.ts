import fs, { type FileHandle } from "node:fs/promises";

import type { Uri } from "vscode";

import { AbstractDocument } from "./abstract-document";

export class BinaryDocument extends AbstractDocument<FileHandle> {
	static async create(uri: Uri): Promise<BinaryDocument> {
		const fileHandle = await fs.open(uri.fsPath, "r");
		const stat = await fileHandle.stat();
		return new BinaryDocument(uri, stat.size, fileHandle);
	}

	private constructor(uri: Uri, byteLength: number, fileHandle: FileHandle) {
		super(uri, byteLength, fileHandle);
	}

	async read(offset: number, byteLength: number): Promise<Uint8Array> {
		byteLength = Math.min(this.byteLength - offset, byteLength);
		const buffer = Buffer.alloc(byteLength);
		await this.fileHandle.read(buffer, 0, byteLength, offset);
		return buffer;
	}

	override dispose() {
		super.dispose();
		this.fileHandle.close();
	}
}
