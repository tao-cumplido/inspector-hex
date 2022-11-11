import { assert } from '../assert';
import { createElement } from '../create-element';
import { hex } from '../hex';

export interface HeaderItem {
	readonly byte: HTMLElement;
	readonly text: HTMLElement;
}

export const viewport = assert.return(document.querySelector<HTMLElement>('.viewport'));
export const columnHeader = assert.return(viewport.querySelector<HTMLElement>('header.column'));
export const headerProgress = assert.return(columnHeader.querySelector<HTMLElement>('.progress'));

export const headerOffsetSpacer = createElement('div', {
	classList: ['spacer', 'cell'],
});

export const headerItems: HeaderItem[] = Array.from({ length: 0x10 }).map((_, index) => {
	return {
		byte: createElement('div', {
			classList: ['cell', 'offset'],
			style: {
				'grid-column': `byte ${index + 1} / span 1`,
			},
			content: hex(index),
		}),
		text: createElement('div', {
			classList: ['cell', 'offset'],
			style: {
				'grid-column': `text ${index + 1} / span 1`,
			},
			content: hex(index),
		}),
	};
});

export let rowHeight = 0;

export function updateRowHeight(): void {
	const div = createElement('div', {
		style: {
			height: `var(--row-height)`,
		},
	});

	document.body.appendChild(div);

	rowHeight = div.getBoundingClientRect().height;

	document.body.removeChild(div);
}
