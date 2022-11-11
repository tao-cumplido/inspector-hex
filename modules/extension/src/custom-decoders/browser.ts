import { window, workspace } from 'vscode';

import type { DecoderItem } from '../decoders';

export function resolveCustomDecoders(): DecoderItem[] {
	const customDecodersConfiguration = workspace
		.getConfiguration('inspectorHex')
		.get<Record<string, string>>('customDecoders');

	if (!customDecodersConfiguration) {
		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		window.showErrorMessage(`Couldn't read custom decoders configuration.`);
		return [];
	}

	const entries = Object.entries(customDecodersConfiguration);

	if (!entries.length) {
		return [];
	}

	// eslint-disable-next-line @typescript-eslint/no-floating-promises
	window.showWarningMessage(`Custom decoders are not supported in virtual workspaces.`);
	return [];
}
