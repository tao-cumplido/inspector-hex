/* eslint-disable @typescript-eslint/no-confusing-void-expression */

import './style.css';

import type { HostMessage } from '@hex/types';

import { handleByteData } from './handle-byte-data';
import { handleTextData } from './handle-text-data';
import { hex } from './hex';
import { render } from './render';
import {
	columnHeader,
	data,
	goToOffset,
	headerItems,
	headerOffsetSpacer,
	headerProgress,
	stat,
	updateRowHeight,
	updateScrollHandle,
} from './state';
import { vscode } from './vscode';

declare global {
	interface WindowEventMap {
		message: MessageEvent<HostMessage>;
	}
}

columnHeader.append(headerOffsetSpacer, ...headerItems.flatMap(({ byte, text }) => [byte, text]));

updateRowHeight();

window.addEventListener('content-scroll', render);

window.addEventListener('message', ({ data: message }) => {
	switch (message.type) {
		case 'stat': {
			const hexDigitCount = message.data.fileSize.toString(16).length;

			stat.offsetHexDigitCount = hexDigitCount + (hexDigitCount % 2);
			stat.fileSize = message.data.fileSize;
			stat.fileRows = Math.ceil(message.data.fileSize / 0x10);
			headerOffsetSpacer.textContent = hex(0, stat.offsetHexDigitCount);

			updateScrollHandle();

			return render();
		}
		case 'bytes': {
			return handleByteData(message.data);
		}
		case 'prepareText': {
			headerProgress.style.visibility = 'visible';

			for (const element of data.header.querySelectorAll('.placeholders')) {
				element.classList.remove('hidden');
			}

			for (const element of data.container.querySelectorAll('section.text')) {
				element.remove();
			}

			return;
		}
		case 'text': {
			headerProgress.style.visibility = 'hidden';
			return handleTextData(message.data);
		}
		case 'goTo': {
			return goToOffset(message.data);
		}
	}
});

vscode.postMessage({ type: 'ready' });
