import type { DataChar } from '@nishin/reader/data';
import { BinaryReader, ReadError } from '@nishin/reader';

import type { Decoder } from '@hex/types';

import { resolveControlCharacter } from './control-characters';
import { errorItem } from './error';

export function unicode(type: DataChar): Decoder {
	return (data, { offset, settings: { renderControlCharacters } }) => {
		const reader = new BinaryReader(data);

		const values = [];

		while (reader.hasNext()) {
			try {
				const { value, byteLength } = reader.next(type);

				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const codePoint = value.codePointAt(0)!;

				if (codePoint < 0x21 || (codePoint >= 0x7f && codePoint < 0xa0)) {
					if (renderControlCharacters === 'off') {
						values.push({ length: byteLength });
					} else {
						values.push({
							text: resolveControlCharacter(codePoint, renderControlCharacters),
							length: byteLength,
							style: {
								color: 'var(--vscode-editorGhostText-foreground)',
							},
						});
					}
					continue;
				}

				values.push({
					text: value,
					length: byteLength,
				});
			} catch (error) {
				if (error instanceof ReadError) {
					const length = Math.min(error.bytes.length, type.encoding.minBytes);
					values.push(errorItem(length));
					reader.skip(length);
				} else {
					throw error;
				}
			}
		}

		return { offset, values };
	};
}
