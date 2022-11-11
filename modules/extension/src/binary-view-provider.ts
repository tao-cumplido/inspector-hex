import type { CustomReadonlyEditorProvider, Disposable, ExtensionContext, Webview, WebviewPanel } from 'vscode';
import { window, Uri } from 'vscode';

import { BinaryDocument } from './binary-document';
import { defaultDecoder } from './decoders';
import { state, SelectedDecoderStatusItem, ViewState } from './state';

const viewStates = new WeakMap<Webview, ViewState>();

export class BinaryViewProvider implements CustomReadonlyEditorProvider<BinaryDocument> {
	private static readonly viewType = 'inspectorHex.binary';

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
			'node_modules/@vscode/webview-ui-toolkit/dist/toolkit.min.js',
		);
		const scriptUri = this.webviewUri(webviewPanel.webview, 'dist/editor/index.js');
		const styleUri = this.webviewUri(webviewPanel.webview, 'dist/editor/index.css');

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
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const currentView = viewStates.get(webviewPanel.webview)!;

			if (webviewPanel.visible) {
				state.visibleViews.add(currentView);
			} else {
				state.visibleViews.delete(currentView);
			}

			if (webviewPanel.active) {
				state.activeView = currentView;
				SelectedDecoderStatusItem.show(state.activeView.decoderItem.label);
			} else if (state.activeView === currentView) {
				state.activeView = null;
				SelectedDecoderStatusItem.hide();
			}
		});

		const viewState = new ViewState(webviewPanel.webview, document, defaultDecoder);

		state.allViews.add(viewState);
		state.activeView = viewState;
		SelectedDecoderStatusItem.show(viewState.decoderItem.label);

		viewStates.set(webviewPanel.webview, viewState);

		if (webviewPanel.visible) {
			state.visibleViews.add(viewState);
		}
	}
}
