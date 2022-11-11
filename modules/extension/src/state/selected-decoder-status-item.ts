import { window, StatusBarAlignment } from 'vscode';

import { SingletonSubscription } from './singleton-subscription';

export class SelectedDecoderStatusItem extends SingletonSubscription {
	static show(label: string): void {
		this.get().item.text = label;
		this.get().item.show();
	}

	static hide(): void {
		this.get().item.hide();
	}

	private readonly item = window.createStatusBarItem(StatusBarAlignment.Right, 0);

	constructor() {
		super();

		this.item.command = 'inspectorHex.selectDecoder';
		this.item.tooltip = 'Select decoder';

		this.subscriptions.push(this.item);
	}
}
