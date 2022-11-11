import type { StatusBarItem } from 'vscode';
import { commands } from 'vscode';

import type { DecoderItem } from '../decoders';
import type { ViewState } from '../state';
import { builtinDecoders } from '../decoders';

export class ExtensionState {
	#activeView: ViewState | null = null;
	#activeDecoderStatusItem?: StatusBarItem;

	decoderItems: DecoderItem[] = builtinDecoders;

	readonly allViews = new Set<ViewState>();
	readonly visibleViews = new Set<ViewState>();

	get activeView(): ViewState | null {
		return this.#activeView;
	}

	set activeView(value: ViewState | null) {
		this.#activeView = value;
		commands.executeCommand('setContext', 'inspectorHex:openEditor', Boolean(value)).then(undefined, console.error);
	}

	get activeDecoderStatusItem(): StatusBarItem {
		if (!this.#activeDecoderStatusItem) {
			throw new Error(`activeDecoderStatusItem hasn't been assigned yet`);
		}

		return this.#activeDecoderStatusItem;
	}

	set activeDecoderStatusItem(value: StatusBarItem) {
		this.#activeDecoderStatusItem = value;
	}
}
