# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Released]

## [0.5.1]

### Added

- Context menu support to remove highlights. You can now remove highlights by right-clicking on them. Additionally, you can remove all highlights by right-clicking the editor tab.

## [0.5.0]

### Rewrite

This is a complete rewrite of the extension. The extension now has an API that others may use to build add-on extensions to extend to other chat services like Youtube or Mixer.

## [0.2.2]

### Added

- Bot response to just `!line` in chat with instructions on how to use it ([96](https://github.com/clarkio/vscode-twitch-highlighter/pull/96) thanks @parithon)

### Changed

- Replaced all UI text and naming in code for "password" with "token" as that is more accurate to its use ([92](https://github.com/clarkio/vscode-twitch-highlighter/pull/92) thanks @parithon)

## [0.2.1]

### Added

- Template for issues ([90](https://github.com/clarkio/vscode-twitch-highlighter/pull/90) thanks @yoannfleurydev)
- Functionality to listen for ban events and remove highlights from banned users in Twitch chat ([99](https://github.com/clarkio/vscode-twitch-highlighter/pull/99) thanks @mpjme)

### Changed

- Updated README to remove duplicate animated gif ([85](https://github.com/clarkio/vscode-twitch-highlighter/pull/85) thanks @parithon)
- Switched from twitch-js library to tmi.js ([97](https://github.com/clarkio/vscode-twitch-highlighter/pull/97) thanks @parithon)

### Fixed

- Inaccurate status in status bar when a token is not provided on initial start up ([91](https://github.com/clarkio/vscode-twitch-highlighter/pull/91) thanks @parithon)

## [0.2.0]

### Added

- Highlights tree view in explorer and debug views ([83](https://github.com/clarkio/vscode-twitch-highlighter/pull/83) thanks @parithon)
- More tests using test theory inputs ([79](https://github.com/clarkio/vscode-twitch-highlighter/pull/79) thanks @parithon)

### Changed

- Location of the button to connect/disconnect the highlight from the chat channel to the left ([83](https://github.com/clarkio/vscode-twitch-highlighter/pull/83) thanks @parithon). This was moved to follow the convention that most extensions which are app based add to the left side of the status bar and the right side is reserved more for editor formatting type actions.
- Icon in activity to be hidden but can be shown via the setting `twitchHighlighter.showHighlightsInActivityBar` ([83](https://github.com/clarkio/vscode-twitch-highlighter/pull/83) thanks @parithon)

## [0.1.5]

### Added

- Ability to unhighlight on disconnect ([#67](https://github.com/clarkio/vscode-twitch-highlighter/pull/67) thanks @parithon)
- Option to highlight multiple lines via one command as well as a comment message ([#68](https://github.com/clarkio/vscode-twitch-highlighter/pull/68) thanks @parithon)
- DevOps badges to show status of development and production builds. Plus media to demonstrate the extension in use and a multi-line highlight example ([#75](https://github.com/clarkio/vscode-twitch-highlighter/pull/75) thanks @parithon)

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

## 0.1.0 - 2019-02-01

- Pre-release version to gather feedback from the community and help identify gaps.

[0.5.0]: https://github.com/clarkio/vscode-twitch-highlighter/compare/0.2.2...0.5.0
[0.2.2]: https://github.com/clarkio/vscode-twitch-highlighter/compare/0.2.1...0.2.2
[0.2.1]: https://github.com/clarkio/vscode-twitch-highlighter/compare/0.2.0...0.2.1
[0.2.0]: https://github.com/clarkio/vscode-twitch-highlighter/compare/0.1.5...0.2.0
[0.1.5]: https://github.com/clarkio/vscode-twitch-highlighter/compare/0.1.4...0.1.5
[0.1.4]: https://github.com/clarkio/vscode-twitch-highlighter/compare/0.1.3...0.1.4
[0.1.3]: https://github.com/clarkio/vscode-twitch-highlighter/compare/0.1.2...0.1.3
[0.1.2]: https://github.com/clarkio/vscode-twitch-highlighter/compare/b28e5041ac...0.1.2
