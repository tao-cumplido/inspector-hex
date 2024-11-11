import type { ExtensionContext } from "vscode";

import { BinaryViewProvider } from "./binary-view-provider";
import { DecodersState, GoToOffset, SelectedDecoderStatusItem } from "./state";

declare module "vscode" {
	export namespace window {
		export function showQuickPick<T extends QuickPickItem>(
			items: readonly T[] | Thenable<readonly T[]>,
			options?: QuickPickOptions,
			token?: CancellationToken,
		): Thenable<Exclude<T, QuickPickItem & { kind: QuickPickItemKind.Separator; }> | undefined>;
	}
}

export function activate(context: ExtensionContext): void {
	context.subscriptions.push(new DecodersState());
	context.subscriptions.push(new SelectedDecoderStatusItem());
	context.subscriptions.push(new GoToOffset());
	context.subscriptions.push(BinaryViewProvider.register(context));
}
