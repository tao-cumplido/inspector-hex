import type { ExtensionContext } from 'vscode';
import { commands, window, workspace, InputBoxValidationSeverity, QuickPickItemKind, StatusBarAlignment } from 'vscode';

import { BinaryViewProvider } from './binary-view-provider';
import { resolveCustomDecoders } from './custom-decoders';
import { builtinDecoders, defaultDecoder } from './decoders';
import { state } from './state';

declare module 'vscode' {
	// eslint-disable-next-line @typescript-eslint/no-namespace, @typescript-eslint/no-shadow
	export namespace window {
		export function showQuickPick<T extends QuickPickItem>(
			items: readonly T[] | Thenable<readonly T[]>,
			options?: QuickPickOptions,
			token?: CancellationToken,
		): Thenable<Exclude<T, QuickPickItem & { kind: QuickPickItemKind.Separator }> | undefined>;
	}
}

function reloadDecoders() {
	state.decoderItems = [...builtinDecoders, ...resolveCustomDecoders(reloadDecoders)];
	state.allViews.forEach((view) => {
		const item = state.decoderItems.find(({ label }) => label === view.decoderItem.label);
		view.decoderItem = item ?? defaultDecoder;
		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		view.prepareText();
	});
}

export function activate(context: ExtensionContext): void {
	state.decoderItems = [...builtinDecoders, ...resolveCustomDecoders(reloadDecoders)];

	state.activeDecoderStatusItem = window.createStatusBarItem(StatusBarAlignment.Right, 0);

	state.activeDecoderStatusItem.command = 'inspectorHex.selectDecoder';
	state.activeDecoderStatusItem.tooltip = 'Select decoder';

	context.subscriptions.push(state.activeDecoderStatusItem);

	context.subscriptions.push(
		workspace.onDidChangeConfiguration((event) => {
			if (event.affectsConfiguration('inspectorHex')) {
				reloadDecoders();
			}
		}),
	);

	context.subscriptions.push(
		commands.registerCommand('inspectorHex.selectDecoder', async () => {
			const items =
				state.decoderItems.length > builtinDecoders.length
					? ([
							{ label: 'Built-in', kind: QuickPickItemKind.Separator },
							...builtinDecoders,
							{ label: 'Custom', kind: QuickPickItemKind.Separator },
							...state.decoderItems.slice(builtinDecoders.length),
					  ] as const)
					: builtinDecoders;

			const item = await window.showQuickPick(items);

			if (item && state.activeView) {
				state.activeDecoderStatusItem.text = item.label;
				state.activeView.decoderItem = item;
				await state.activeView.prepareText();
			}
		}),
	);

	context.subscriptions.push(commands.registerCommand('inspectorHex.reloadDecoders', reloadDecoders));

	context.subscriptions.push(
		commands.registerCommand('inspectorHex.goToOffset', async () => {
			const input = await window.showInputBox({
				title: 'Go to offset',
				prompt: 'Enter an offset in hexadecimal notation.',
				// eslint-disable-next-line @typescript-eslint/no-shadow
				validateInput: (input) => {
					const value = parseInt(input, 16);

					if (Number.isNaN(value) || !/^[0-9a-f]+$/iu.test(input)) {
						return {
							severity: InputBoxValidationSeverity.Error,
							message: 'Invalid input',
						};
					}

					const size = state.activeView?.document.byteLength ?? 0;

					if (value >= size) {
						return {
							severity: InputBoxValidationSeverity.Warning,
							message: 'Input exceeds file size',
						};
					}

					return null;
				},
			});

			if (!input) {
				return;
			}

			await state.activeView?.goToOffset(parseInt(input, 16));
		}),
	);

	context.subscriptions.push(BinaryViewProvider.register(context));
}
