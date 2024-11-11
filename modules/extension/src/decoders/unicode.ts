import type { Decoder } from "@inspector-hex/api";
import { BinaryReader, DataType, ReadError, ReadMode, type ByteOrder, type Encoding } from "@nishin/reader";

import { resolveControlCharacter } from "./control-characters";
import { errorItem } from "./error";

export function unicode(encoding: Encoding, byteOrder?: ByteOrder): Decoder {
	const type = DataType.char(encoding);
	return (data, { offset, settings: { renderControlCharacters, }, }) => {
		const reader = new BinaryReader(data, byteOrder);

		const values = [];

		while (reader.hasNext()) {
			try {
				const { value, source, } = reader.next(type, ReadMode.Source);

				const codePoint = value.codePointAt(0)!;

				if (codePoint < 0x21 || (codePoint >= 0x7f && codePoint < 0xa0)) {
					if (renderControlCharacters === "off") {
						values.push({ length: source.byteLength, });
					} else {
						values.push({
							text: resolveControlCharacter(codePoint, renderControlCharacters),
							length: source.byteLength,
							style: {
								color: "var(--vscode-editorGhostText-foreground)",
							},
						});
					}
					continue;
				}

				values.push({
					text: value,
					length: source.byteLength,
				});
			} catch (error) {
				if (error instanceof ReadError) {
					const length = Math.min(error.bytes.length, encoding.minBytes);
					values.push(errorItem(length));
					reader.skip(length);
				} else {
					throw error;
				}
			}
		}

		return { offset, values, };
	};
}
