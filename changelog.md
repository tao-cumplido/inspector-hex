# Change Log

All notable changes to the "Inspector Hex" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Changed
- Update dependencies
- Replace deprecated `@vscode/webview-ui-toolkit` with `@vscode-elements/elements`
### Fixed
- Build pipeline

## [0.3.7] -- 2023-02-11
### Added
- Configuration for assigning default decoders to glob paths

## [0.3.6] -- 2023-02-06
### Fixed
- Failed to run extension due to missing `esbuild` dependency

## [0.3.5] -- 2023-02-06
### Added
- Experimental TypeScript support for custom decoders

## [0.3.2] -- 2023-02-03
### Changed
- Update `@nishin/reader` to 0.4.1
- Use `subarray` instead of `slice` in virtual workspaces for minor performance improvement
### Fixed
- Close file handle when editor is closed

## [0.3.1] -- 2022-11-11
### Added
- Changelog
### Changed
- Replace MP4 with GIF in readme as VS Code doesn't support inline video playback in Markdown
### Fixed
- Repository links in `package.json`

## [0.3.0] -- 2022-11-11
- Initial release, rewritten and rebranded from https://github.com/tao-cumplido/vscode-hex-viewer
