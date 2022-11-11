import type { StatusBarItem } from 'vscode';
import { window, StatusBarAlignment } from 'vscode';

import { SingletonDisposable } from './singleton-disposable';

export class SelectedDecoderStatusItem extends SingletonDisposable {
	static show(label: string): void {
		this.get().item.text = label;
		this.get().item.show();
	}

	static hide(): void {
		this.get().item.hide();
	}

	private readonly item: StatusBarItem;

	constructor() {
		super(() => this.item.dispose());

		this.item = window.createStatusBarItem(StatusBarAlignment.Right, 0);
		this.item.command = 'inspectorHex.selectDecoder';
		this.item.tooltip = 'Select decoder';
	}
}
