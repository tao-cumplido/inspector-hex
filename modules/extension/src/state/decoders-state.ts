import { commands, QuickPickItemKind, window, workspace } from "vscode";

import { resolveCustomDecoders } from "../custom-decoders";
import { builtinDecoders, defaultDecoder, type DecoderItem } from "../decoders";
import { DocumentView } from "./document-view";
import { SelectedDecoderStatusItem } from "./selected-decoder-status-item";
import { SingletonSubscription } from "./singleton-subscription";

export class DecodersState extends SingletonSubscription {
	static get items(): readonly DecoderItem[] {
		return this.get().items;
	}

	readonly items = [ ...builtinDecoders, ...resolveCustomDecoders(() => this.reload()), ];

	constructor() {
		super();

		this.subscriptions.push(
			workspace.onDidChangeConfiguration((event) => {
				if (event.affectsConfiguration("inspectorHex")) {
					this.reload();
				}
			}),

			commands.registerCommand("inspectorHex.reloadDecoders", () => this.reload()),

			commands.registerCommand("inspectorHex.selectDecoder", async () => {
				const item = await window.showQuickPick(
					(() => {
						if (this.items.length > builtinDecoders.length) {
							return [
								{ label: "Built-in", kind: QuickPickItemKind.Separator, },
								...builtinDecoders,
								{ label: "Custom", kind: QuickPickItemKind.Separator, },
								...this.items.slice(builtinDecoders.length),
							] as const;
						}

						return builtinDecoders;
					})(),
				);

				if (item && DocumentView.active) {
					SelectedDecoderStatusItem.show(item.label);
					DocumentView.active.decoderItem = item;
					await DocumentView.active.prepareText();
				}
			}),
		);
	}

	private reload() {
		// @ts-expect-error
		this.items = [ ...builtinDecoders, ...resolveCustomDecoders(() => this.reload()), ];
		DocumentView.all.forEach((view) => {
			const item = this.items.find(({ label, }) => label === view.decoderItem.label);
			view.decoderItem = item ?? defaultDecoder;
			view.prepareText();
		});
	}
}
