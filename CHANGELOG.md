# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Released]

## [0.1.4]

### Added

- A setting to allow changes to font color within highlights ([#55](https://github.com/clarkio/vscode-twitch-highlighter/pull/55))
- An .editorconfig file to keep styling consistent. ([#54](https://github.com/clarkio/vscode-twitch-highlighter/pull/54) thanks @parithon)
- Arbitrary tests to get things started in that area ([#69](https://github.com/clarkio/vscode-twitch-highlighter/pull/69) thanks @parithon)
- Use of webpack to significantly reduce the size of the extension and improve the install speed ([#66](https://github.com/clarkio/vscode-twitch-highlighter/pull/66) thanks @parithon)

### Changed

- Client code with some refactoring to clean it up ([#57](https://github.com/clarkio/vscode-twitch-highlighter/pull/57) thanks @parithon)
- Commands to use categories for grouping of them ([#63](https://github.com/clarkio/vscode-twitch-highlighter/pull/63) thanks @matthewkosloski)

### Removed

- Use of Twitch Glitch logo in the VS Code marketplace and in the activity bar icon. See PR for more details on why ([#65](https://github.com/clarkio/vscode-twitch-highlighter/pull/65) thanks @parithon)

## [0.1.3] - 2019-02-07

### Changed

- Setting names to be camelCase ([#48](https://github.com/clarkio/vscode-twitch-highlighter/pull/48))
- README with better instructions to get started ([#43](https://github.com/clarkio/vscode-twitch-highlighter/pull/43) thanks @FletcherCodes)
- Icon used in the VS Code Marketplace for better contrast/visibility ([#50](https://github.com/clarkio/vscode-twitch-highlighter/pull/50) thanks @parithon)

## [0.1.2] - 2019-02-03

### Fixed

- Issues where commands were not registering. The cause was from node_modules not being included in the package.

## [0.1.0] - 2019-02-01

- Pre-release version to gather feedback from the community and help identify gaps.
