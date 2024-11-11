export function errorItem(length: number) {
	return {
		length,
		style: {
			color: "var(--vscode-editorError-foreground)",
		},
	};
}
