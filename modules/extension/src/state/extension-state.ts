import { commands } from 'vscode';

import type { DecoderItem } from '../decoders';
import type { ViewState } from '../state';
import { builtinDecoders } from '../decoders';

export class ExtensionState {
	#activeView: ViewState | null = null;

	decoderItems: DecoderItem[] = builtinDecoders;

	readonly allViews = new Set<ViewState>();
	readonly visibleViews = new Set<ViewState>();

	get activeView(): ViewState | null {
		return this.#activeView;
	}

	set activeView(value: ViewState | null) {
		this.#activeView = value;
		commands.executeCommand('setContext', 'inspectorHex:openEditor', Boolean(value));
	}
}
