import { commands, InputBoxValidationSeverity, window } from "vscode";

import { DocumentView } from "./document-view";
import { SingletonSubscription } from "./singleton-subscription";

export class GoToOffset extends SingletonSubscription {
	constructor() {
		super();

		this.subscriptions.push(
			commands.registerCommand("inspectorHex.goToOffset", async () => {
				const input = await window.showInputBox({
					title: "Go to offset",
					prompt: "Enter an offset in hexadecimal notation.",
					validateInput: (data) => {
						const value = parseInt(data, 16);

						if (Number.isNaN(value) || !/^[0-9a-f]+$/iu.test(data)) {
							return {
								severity: InputBoxValidationSeverity.Error,
								message: "Invalid input",
							};
						}

						const size = DocumentView.active?.document.byteLength ?? 0;

						if (value >= size) {
							return {
								severity: InputBoxValidationSeverity.Warning,
								message: "Input exceeds file size",
							};
						}

						return null;
					},
				});

				if (!input || !DocumentView.active) {
					return;
				}

				await DocumentView.active.goToOffset(parseInt(input, 16));
			}),
		);
	}
}
