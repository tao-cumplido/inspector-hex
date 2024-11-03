import { createElement } from "./create-element";
import { hex } from "./hex";
import {
	contentHeight,
	data,
	headerProgress,
	resetData,
	rowHeight,
	scrollFactorY,
	stat,
	viewportHeight,
} from "./state";
import { vscode } from "./vscode";

let debounceTimer = 0;
let lastFirstRendered: number | null = null;

export function render(): void {
	const maxVisibleRows = Math.ceil(viewportHeight / rowHeight);
	const firstVisibleRow = Math.floor((scrollFactorY * contentHeight) / rowHeight);

	if (
		lastFirstRendered === null ||
		firstVisibleRow >= lastFirstRendered + maxVisibleRows ||
		firstVisibleRow <= lastFirstRendered - maxVisibleRows
	) {
		const overscrollRows = Math.ceil(1.5 * maxVisibleRows);

		const renderStartIndex = Math.max(0, firstVisibleRow - overscrollRows);
		const renderEndIndex = Math.min(stat.fileRows, firstVisibleRow + maxVisibleRows + overscrollRows);
		const renderStartOffset = renderStartIndex * 0x10;
		const renderEndOffset = renderEndIndex * 0x10;
		const renderByteLength = renderEndOffset - renderStartOffset;

		lastFirstRendered = firstVisibleRow;

		resetData();

		const headerFragment = document.createDocumentFragment();
		const placeholderFragment = document.createDocumentFragment();

		for (let rowIndex = renderStartIndex; rowIndex < renderEndIndex; rowIndex++) {
			const cell = createElement("div", {
				classList: [ "cell", "offset", ],
				style: {
					"--row-index": `${rowIndex}`,
				},
				content: hex(rowIndex * 0x10, stat.offsetHexDigitCount),
			});

			data.rows.set(rowIndex, { offset: cell, bytes: new Array<HTMLElement>(16), text: [], });

			headerFragment.appendChild(cell);

			const lineSpan = stat.fileRows - 1 === rowIndex ? stat.fileSize % 0x10 : 0x10;

			placeholderFragment.appendChild(
				createElement("div", {
					classList: [ "cell", ],
					style: {
						"--row-index": `${rowIndex}`,
						"grid-column": `byte 1 / span ${lineSpan}`,
					},
					content: createElement("div", {
						classList: [ "skeleton", ],
					}),
				}),
			);

			placeholderFragment.appendChild(
				createElement("div", {
					classList: [ "cell", ],
					style: {
						"--row-index": `${rowIndex}`,
						"grid-column": `text 1 / span ${lineSpan}`,
					},
					content: createElement("div", {
						classList: [ "skeleton", ],
					}),
				}),
			);
		}

		data.header.appendChild(headerFragment);
		data.header.appendChild(
			createElement("div", {
				classList: [ "placeholders", ],
				content: placeholderFragment,
			}),
		);

		clearTimeout(debounceTimer);

		debounceTimer = setTimeout(() => {
			headerProgress.style.visibility = "visible";
			vscode.postMessage({ type: "fetchBytes", data: { offset: renderStartOffset, byteLength: renderByteLength, }, });
		}, 250);
	}
}
