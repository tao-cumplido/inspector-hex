module.exports = {
	printWidth: 120,
	useTabs: true,
	tabWidth: 1,
	semi: true,
	singleQuote: true,
	quoteProps: 'consistent',
	trailingComma: 'all',
	arrowParens: 'always',
	overrides: [
		{
			files: '*.sh',
			options: {
				indent: 0,
				binaryNextLine: false,
				switchCaseIndent: true,
				spaceRedirects: true,
				keepPadding: false,
				minify: false,
				functionNextLine: false,
			},
		},
	],
};
