import type { DecoderResult } from '@hex/types';

import type { DataRow, HeaderItem } from './state';
import { assert } from './assert';
import { createElement } from './create-element';
import { data, headerItems, selectedOffsets, viewport } from './state';

const cellInfos = new WeakMap<HTMLElement, { offset: number; length: number }>();

function updateTextRelations(
	rows: DataRow[],
	columns: HeaderItem[],
	textCells: HTMLElement[],
	byteCells: HTMLElement[],
) {
	for (const cell of byteCells) {
		const relations = data.byteRelations.get(cell);

		if (!relations) {
			break;
		}

		for (const item of byteCells) {
			if (item !== cell) {
				relations.weak.push(item);
			}
		}

		for (const { byte } of columns) {
			relations.weak.push(byte);
		}

		for (const { bytes, offset } of rows) {
			if (!bytes.includes(cell) && offset) {
				relations.weak.push(offset);
			}
		}

		for (const { text } of columns) {
			relations.text.columns.push(text);
		}

		relations.text.unit.push(...textCells);
	}

	const { textRelations } = data;

	for (const cell of textCells) {
		const listener = new Map<string, () => unknown>();

		listener.set('mouseenter', () => {
			const relations = assert.return(textRelations.get(cell));

			for (const element of [...relations.rows, ...relations.columns, ...relations.bytes, ...relations.text]) {
				element.classList.add('highlight');
			}
		});

		listener.set('mouseleave', () => {
			const relations = assert.return(textRelations.get(cell));

			for (const element of [...relations.rows, ...relations.columns, ...relations.bytes, ...relations.text]) {
				element.classList.remove('highlight');
			}
		});

		listener.set('mousedown', () => {
			const { offset, length } = assert.return(cellInfos.get(cell));
			const relations = assert.return(textRelations.get(cell));

			for (const element of relations.text) {
				element.classList.toggle('selected');
			}

			for (let i = offset; i < offset + length; i++) {
				if (cell.classList.contains('selected')) {
					selectedOffsets.add(i);
				} else {
					selectedOffsets.delete(i);
				}
			}

			for (const element of relations.bytes) {
				if (cell.classList.contains('selected')) {
					element.classList.add('selected');
				} else {
					element.classList.remove('selected');
				}
			}
		});

		for (const [event, callback] of listener) {
			cell.addEventListener(event, callback);
		}

		data.listeners.set(cell, listener);

		const resultRows: HTMLElement[] = [];
		const resultColumns: HTMLElement[] = [];

		for (const { offset } of rows) {
			if (offset) {
				resultRows.push(offset);
			}
		}

		for (const { byte, text } of columns) {
			resultColumns.push(byte, text);
		}

		data.textRelations.set(cell, {
			rows: resultRows,
			columns: resultColumns,
			bytes: byteCells,
			text: textCells,
		});
	}
}

export function handleTextData(result: null | DecoderResult): void {
	data.textRelations.clear();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/naming-convention
	for (const [_, relations] of data.byteRelations) {
		relations.weak.length = 0;
		relations.text.columns.length = 0;
		relations.text.unit.length = 0;
	}

	const fragment = document.createDocumentFragment();

	if (result) {
		const { offset: startOffset, values } = result;

		let offset = startOffset;

		for (const value of values) {
			const columnIndex = offset % 0x10;
			const rowIndex = Math.floor(offset / 0x10);
			const row = data.rows.get(rowIndex) ?? { bytes: [], text: [] };

			data.rows.set(rowIndex, row);

			if (typeof value === 'string' || !value) {
				const cell = createElement('div', {
					classList: ['cell', value ? '' : 'empty', selectedOffsets.has(offset) ? 'selected' : ''],
					style: {
						'--row-index': `${rowIndex}`,
						'grid-column': `text ${columnIndex + 1} / span 1`,
					},
					content: value ?? '.',
				});

				cellInfos.set(cell, { offset, length: 1 });

				offset++;

				const byteCell = row.bytes[columnIndex];

				updateTextRelations([row], [assert.return(headerItems[columnIndex])], [cell], byteCell ? [byteCell] : []);

				fragment.appendChild(cell);
			} else {
				const length = value.length ?? 1;
				const selected = selectedOffsets.hasRange(offset, length) ? 'selected' : '';

				if (columnIndex + length > 0x10) {
					const start = (-columnIndex + 0x10) % 0x10;
					const end = (offset + length) % 0x10;

					const lastIndex = rowIndex + 1 + (length - start - end) / 0x10;

					const textCells: HTMLElement[] = [];

					let cell = createElement('div', {
						classList: ['cell', value.text ? '' : 'empty', selected],
						style: {
							...value.style,
							'--row-index': `${rowIndex}`,
							'grid-column': `text ${columnIndex + 1} / span ${start}`,
						},
						content: value.text ?? '.',
					});

					cellInfos.set(cell, { offset, length });

					textCells.push(cell);
					fragment.appendChild(cell);

					for (let i = rowIndex + 1; i < lastIndex; i++) {
						cell = createElement('div', {
							classList: ['cell', selected],
							style: {
								'--row-index': `${i}`,
								'grid-column': `text 1 / span ${0x10}`,
							},
						});

						cellInfos.set(cell, { offset, length });

						textCells.push(cell);
						fragment.appendChild(cell);
					}

					cell = createElement('div', {
						classList: ['cell', selected],
						style: {
							'--row-index': `${lastIndex}`,
							'grid-column': `text 1 / span ${end}`,
						},
					});

					cellInfos.set(cell, { offset, length });

					textCells.push(cell);
					fragment.appendChild(cell);

					const rows: DataRow[] = [];

					for (const [index, dataRow] of data.rows) {
						if (index >= rowIndex && index <= lastIndex) {
							rows.push(dataRow);
						}
					}

					const headerCells =
						textCells.length > 2 ? headerItems : [...headerItems.slice(0, end), ...headerItems.slice(columnIndex)];

					const byteCells: HTMLElement[] = rows.flatMap(({ bytes }, rowN, source) => {
						if (rowN === 0) {
							return bytes.slice(columnIndex);
						}

						if (rowN === source.length - 1) {
							return bytes.slice(0, end);
						}

						return bytes;
					});

					updateTextRelations(rows, headerCells, textCells, byteCells);
				} else {
					const cell = createElement('div', {
						classList: ['cell', value.text ? '' : 'empty', selected],
						style: {
							...value.style,
							'--row-index': `${rowIndex}`,
							'grid-column': `text ${columnIndex + 1} / span ${length}`,
						},
						content: value.text ?? '.',
					});

					cellInfos.set(cell, { offset, length });

					const byteCells = row.bytes.slice(columnIndex, columnIndex + length);
					const headerCells = headerItems.slice(columnIndex, columnIndex + length);

					updateTextRelations([row], headerCells, [cell], byteCells);

					row.text.push(cell);
					fragment.appendChild(cell);
				}

				offset += length;
			}
		}
	}

	data.textSection = createElement('section', {
		classList: ['text'],
	});

	data.textSection.appendChild(fragment);

	data.container.appendChild(data.textSection);

	for (const element of data.header.querySelectorAll('.placeholders')) {
		element.classList.add('hidden');
	}

	for (const element of data.container.querySelectorAll('section.text')) {
		if (element !== data.textSection) {
			element.remove();
		}
	}

	for (const element of viewport.querySelectorAll('.container')) {
		if (element !== data.container) {
			element.remove();
		}
	}
}
