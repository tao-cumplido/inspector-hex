import fs from 'fs';
import path from 'path';

import clearModule from 'clear-module';
import { window, workspace } from 'vscode';

import type { PotentialDecoder } from '@hex/types';

import type { DecoderItem } from '../decoders';
import { output } from '../output';
import { state } from '../state';

const customDecoderWatchers = new Set<fs.FSWatcher>();

export function resolveCustomDecoders(reload: () => void): DecoderItem[] {
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

	const root = state.activeView
		? workspace.getWorkspaceFolder(state.activeView.document.uri)
		: workspace.workspaceFolders?.[0];

	if (!root) {
		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		window.showErrorMessage(`Couldn't resolve workspace root for custom decoders.`);
		return [];
	}

	if (root.uri.scheme !== 'file') {
		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		window.showWarningMessage(`Custom decoders are not supported in virtual workspaces.`);
		return [];
	}

	return entries.reduce<DecoderItem[]>((result, [label, file]) => {
		try {
			const destinationPath = path.isAbsolute(file) ? file : path.join(root.uri.fsPath, file);

			const currentWatcher = fs.watch(destinationPath, () => {
				if (customDecoderWatchers.has(currentWatcher)) {
					for (const watcher of customDecoderWatchers) {
						watcher.close();
					}

					customDecoderWatchers.clear();
					reload();
				}
			});

			customDecoderWatchers.add(currentWatcher);

			clearModule(destinationPath);

			const cwd = process.cwd();

			process.chdir(path.isAbsolute(file) ? path.dirname(destinationPath) : root.uri.fsPath);

			// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
			const decoder: unknown = require(destinationPath);

			process.chdir(cwd);

			if (typeof decoder !== 'function') {
				throw new TypeError(`Custom decoder '${label}' is not a function`);
			}

			result.push({
				label,
				decoder: decoder as PotentialDecoder,
			});
		} catch (error) {
			// eslint-disable-next-line @typescript-eslint/no-floating-promises
			window.showErrorMessage(`Error resolving custom decoder '${label}'. See output for details.`);
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			output.appendLine(`${error}\n`);
		}

		return result;
	}, []);
}
