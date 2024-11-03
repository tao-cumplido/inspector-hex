import type { ClientMessage } from "@hex/types";

declare module "vscode-webview" {
	export interface WebviewApi<StateType> {
		postMessage(message: ClientMessage): void;
	}
}

// https://code.visualstudio.com/api/extension-guides/webview#passing-messages-from-a-webview-to-an-extension
export const vscode = acquireVsCodeApi();
