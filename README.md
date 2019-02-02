# Twitch Line Highlighter VS Code Extension

A VS Code extension to allow your Twitch viewers to help in spotting bugs, typos, etc. etc. by sending a command in chat that will highlight the line of code they want you to check.

## Attribution

Some of the code in this extension has been adapted from the [twitchlint extension](https://github.com/irth/twitchlint) built by [@irth](https://github.com/irth)

## Features

- Allow Twitch viewers to highlight and unhighlight lines of code in the currently active file in VS Code.
- Remove all highlights at once.
- View a list of all highlights per file in an explorer panel.
- Control connection to a Twitch channel's chat.

## Requirements

- A Twitch account ([sign up here](https://www.twitch.tv/signup))
- Register an application [here](https://glass.twitch.tv/console/apps/create)
- An OAuth token which you can generate [here](http://twitchapps.com/tmi/)
- [VS Code](https://code.visualstudio.com)

## Getting Started

From the Command Palette:
1. Run `Twitch Highlighter: Set Client Id`
2. Paste the Client ID from your application
3. Run `Twitch Highlighter: Set Password`
4. Paste your generated OAuth token with the 'OAuth:' in front

Outside of the Command Palette:

5. Set `twitchhighlighter.channels` to your channel in User/Workspace Settings

        "twitchhighlighter.channels": ["clarkio"]

6. Hit `Disconnected` at the bottom right of VS Code to connect

## Twitch Commands

To highlight a line, use:

        !highlight <LineNumber> OR !line <LineNumber>
        
To unhighlight a line, use:

        !line !<LineNumber>

## Extension Settings

- `twitchhighlighter.channels`: The channel name(s) to connect to on Twitch.
        
        Example: `['clarkio'], Another Example: ['clarkio', 'parithon']
        
- `twitchhighlighter.nickname`: The username the bot should use when joining a Twitch channel.
- `twitchhighlighter.highlightColor`: Background color of the decoration. Use rgba() and define transparent background colors to play well with other decorations.

        Example: green
        
- `twitchhighlighter.highlightBorder`: CSS styling property that will be applied to text enclosed by a decoration.
- `twitchhighlighter.announceBot`: Whether or not the bot should announce its joining or leaving the chat room.
- `twitchhighlighter.joinMessage`: The message the bot will say when joining a chat room
- `twitchhighlighter.leaveMessage`: The message the bot will say when leaving a chat room

## Known Issues

- Extension doesn't allow specifying the file to put the highlight in. This is a work in progress.

## Release Notes

Users appreciate release notes as you update your extension.

### 0.1.0

Pre-release version to gather feedback from the community and help identify gaps.
