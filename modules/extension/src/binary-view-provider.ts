import { minimatch } from "minimatch";
import {
	Uri,
	window,
	workspace,
	type CustomReadonlyEditorProvider,
	type Disposable,
	type ExtensionContext,
	type Webview,
	type WebviewPanel,
} from "vscode";

import { BinaryDocument } from "./binary-document";
import { defaultDecoder } from "./decoders";
import { DecodersState, DocumentView, SelectedDecoderStatusItem } from "./state";

const viewStates = new WeakMap<Webview, DocumentView>();

export class BinaryViewProvider implements CustomReadonlyEditorProvider<BinaryDocument> {
	private static readonly viewType = "inspectorHex.binary";

	static register(context: ExtensionContext): Disposable {
		return window.registerCustomEditorProvider(BinaryViewProvider.viewType, new BinaryViewProvider(context), {
			webviewOptions: {
				retainContextWhenHidden: true,
			},
		});
	}

	private readonly context;

	constructor(context: ExtensionContext) {
		this.context = context;
	}

	private webviewUri(webview: Webview, ...paths: string[]) {
		return webview.asWebviewUri(Uri.joinPath(this.context.extensionUri, ...paths)).toString();
	}

	async openCustomDocument(uri: Uri) {
		return BinaryDocument.create(uri);
	}

	resolveCustomEditor(document: BinaryDocument, webviewPanel: WebviewPanel) {
		webviewPanel.webview.options = {
			enableScripts: true,
		};

		const vscodeUiToolkitUri = this.webviewUri(
			webviewPanel.webview,
			"node_modules/@vscode/webview-ui-toolkit/dist/toolkit.min.js",
		);
		const scriptUri = this.webviewUri(webviewPanel.webview, "dist/editor/index.js");
		const styleUri = this.webviewUri(webviewPanel.webview, "dist/editor/index.css");

		webviewPanel.webview.html = /* html */ `
			<!doctype html>
			<html lang="en">
				<head>
					<meta charset="UTF-8" />
					<title>Hex-View</title>
					<script type="module" src="${vscodeUiToolkitUri}"></script>
					<script type="module" crossorigin src="${scriptUri}"></script>
					<link rel="stylesheet" href="${styleUri}">
				</head>
				<body>
					<div class="viewport">
						<header class="column">
							<div class="background"></div>
							<div class="progress">
								<vscode-progress-ring></vscode-progress-ring>
							</div>
						</header>
					</div>
					<div class="scrollbar vertical">
						<div class="handle"></div>
					</div>
					<div class="scrollbar horizontal">
						<div class="handle"></div>
					</div>
					<div class="scrollbar corner"></div>
				</body>
			</html>
		`;

		webviewPanel.onDidChangeViewState(() => {
			const currentView = viewStates.get(webviewPanel.webview)!;

			if (webviewPanel.visible) {
				DocumentView.visible.add(currentView);
			} else {
				DocumentView.visible.delete(currentView);
			}

			if (webviewPanel.active) {
				DocumentView.active = currentView;
				SelectedDecoderStatusItem.show(DocumentView.active.decoderItem.label);
			} else if (DocumentView.active === currentView) {
				DocumentView.active = null;
				SelectedDecoderStatusItem.hide();
			}
		});

		const defaultDecodersConfiguration =
			workspace.getConfiguration("inspectorHex").get<Record<string, string>>("defaultDecoders") ?? {};

		const relativePath = workspace.asRelativePath(document.uri, false);

		const defaultEntry = Object.entries(defaultDecodersConfiguration).find(([ pattern, ]) => {
			const path = pattern.startsWith("/") ? document.uri.fsPath : relativePath;
			return minimatch(path, pattern);
		});

		const decoder = DecodersState.items.find(({ label, }) => label === defaultEntry?.[1]) ?? defaultDecoder;

		const viewState = new DocumentView(webviewPanel.webview, document, decoder);

		DocumentView.all.add(viewState);
		DocumentView.active = viewState;
		SelectedDecoderStatusItem.show(viewState.decoderItem.label);

		viewStates.set(webviewPanel.webview, viewState);

		if (webviewPanel.visible) {
			DocumentView.visible.add(viewState);
		}
	}
}
