import type { ClientMessage } from '@hex/types';

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
interface VsCodeApi {
	postMessage: (message: ClientMessage) => void;
	getState: () => unknown;
	setState: (value: unknown) => void;
}

// @ts-expect-error: https://code.visualstudio.com/api/extension-guides/webview#passing-messages-from-a-webview-to-an-extension
export const vscode: VsCodeApi = acquireVsCodeApi();
