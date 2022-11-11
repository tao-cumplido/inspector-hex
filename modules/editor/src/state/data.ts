import { createElement } from '../create-element';
import { viewport } from './dom';

export interface DataRow {
	readonly offset?: HTMLElement;
	readonly bytes: HTMLElement[];
	readonly text: HTMLElement[];
}

export interface ByteRelation {
	readonly row: HTMLElement;
	readonly column: HTMLElement;
	readonly weak: HTMLElement[];
	readonly text: {
		readonly columns: HTMLElement[];
		readonly unit: HTMLElement[];
	};
}

export interface TextRelation {
	readonly rows: readonly HTMLElement[];
	readonly columns: readonly HTMLElement[];
	readonly bytes: readonly HTMLElement[];
	readonly text: readonly HTMLElement[];
}

export interface Data {
	container: HTMLElement;
	header: HTMLElement;
	bytesSection: HTMLElement;
	textSection: HTMLElement;
	byteRelations: Map<HTMLElement, ByteRelation>;
	textRelations: Map<HTMLElement, TextRelation>;
	listeners: Map<HTMLElement, Map<string, () => unknown>>;
	rows: Map<number, DataRow>;
}

// eslint-disable-next-line @typescript-eslint/init-declarations
export let data!: Data;

export function resetData(): Data {
	const header = createElement('header', {
		classList: ['row'],
	});

	const bytesSection = createElement('section', {
		classList: ['bytes'],
	});

	const textSection = createElement('section', {
		classList: ['text'],
	});

	for (const element of viewport.querySelectorAll('.container')) {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (element !== data?.container) {
			element.remove();
		}
	}

	data = {
		container: createElement('div', {
			classList: ['container'],
			content: [header, bytesSection, textSection],
		}),
		header,
		bytesSection,
		textSection,
		byteRelations: new Map(),
		textRelations: new Map(),
		listeners: new Map(),
		rows: new Map(),
	};

	viewport.appendChild(data.container);

	return data;
}

resetData();
