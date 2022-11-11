// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function errorItem(length: number) {
	return {
		length,
		style: {
			color: 'var(--vscode-editorError-foreground)',
		},
	};
}
