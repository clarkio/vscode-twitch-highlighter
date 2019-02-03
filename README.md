# Twitch Line Highlighter VS Code Extension

A VS Code extension to allow your Twitch viewers to help in spotting bugs, typos, etc. etc. by sending a command in chat that will highlight the line of code they want you to check.

## Requirements

You just need an oauth:asdlfkasdjf pass to run the chat bot

In order to use this extension you will need the following before going to the [Getting Started](#getting-started) section:

- An installed version of [VS Code](https://code.visualstudio.com)
- A Twitch account for yourself or a separate one to be used as a chat bot ([sign up here](https://www.twitch.tv/signup))
- While logged in as your own account or as a separate account to go to 

## Getting Started

1. Install the extension from the [marketplace](https://marketplace.visualstudio.com/items?itemName=clarkio.twitch-highlighter)
2. Open your VS Code settings

   - Keyboard shortcut: `CTRL/CMD + ,`

3. Type in "twitch" into the search bar
4. Find the `Twitch Highlighter: Channels` setting and click on "Edit in settings.json"
5. Add a new entry to the JSON settings file with the setting key `"twitchhighlighter.channels"` and a value that's an array of strings. For now this can just contain one string and its value should be the name of your Twitch account/channel.

   Example:

   ```json
   {
     "twitchhighlighter.channels": ["clarkio"]
   }
   ```

6. Save your changes and close that tab. Go back to the Settings UI tab.
7. Find the `Nickname` setting. If you are using your own account for the chat bot then enter your account username as the value here. If you created a separate account use that username. Save your changes.
8. In the status bar, click the "Disconnected" button. You'll see a notification that the extension is missing Twitch Credentials.
9. Click the "Set Credentials" button
10. You'll now see a prompt in the top middle of VS Code asking you to enter your Twitch Client Id. This is what you copied and saved from earlier. Copy and paste the value into this prompt and press `Enter`
11. Next you'll be prompted to enter your Twitch token. This is the secret you copied and saved from earlier. If you're using your own account it should be a value prefixed with `oauth:`. If you're using a separate account it should be a random GUID value. Copy and paste the secret into this prompt and press `Enter`

From the Command Palette:

1. Run `Twitch Highlighter: Set Client Id`
1. Paste the Client ID from your application
1. Run `Twitch Highlighter: Set Password`
1. Paste your generated OAuth token with the 'oauth:' in front

Outside of the Command Palette:

5.  Set `twitchhighlighter.channels` to your channel in User/Workspace Settings

        "twitchhighlighter.channels": ["clarkio"]

6.  Hit `Disconnected` at the bottom right of VS Code to connect

## Attribution

Some of the code in this extension has been adapted from the [twitchlint extension](https://github.com/irth/twitchlint) built by [@irth](https://github.com/irth)

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

* `twitchhighlighter.highlightBorder`: CSS styling property that will be applied to text enclosed by a decoration.
* `twitchhighlighter.announceBot`: Whether or not the bot should announce its joining or leaving the chat room.
* `twitchhighlighter.joinMessage`: The message the bot will say when joining a chat room
* `twitchhighlighter.leaveMessage`: The message the bot will say when leaving a chat room

## Separate Twitch Account

Using a separate Twitch account for your chat bot allows you to keep your own personal account more secure by separating this responsibility. It also allows any messages sent to your chat from the bot to be shown under a unique name instead of your own account.

Follow these instructions to get the proper requirements for using a separate Twitch account as a chat bot:

1. Create your chat bot as an application [here](https://glass.twitch.tv/console/apps/create)
2. Enter a name for the chat bot (such as "VS Code Highlighter Bot"), provide any localhost based url for the "Redirect URL" (example: http://localhost:1337), and choose the "Chat Bot" category.
3. Click the "Create" button and you should be automatically redirected to the "Apps" view in the Dashboard. (here's a direct link in case that doesn't happen: https://glass.twitch.tv/console/apps)
4. Click the "Manage" button for your newly created app.
5. You should now see a "Client ID" field. Copy and save the value of this field somewhere safe temporarily (it will be needed later)
6. Under "Client Secret" click the "New Secret" button. You'll be prompted to make sure you want to generate a new secret so choose "OK" to proceed.
7. A client secret value should appear under the "Client Secret" section. Copy and save the value of this secret somewhere safe temporarily (it will be needed later)
8. You are now ready to proceed to the [Getting Started](#getting-started) section.

## Your Own Twitch Account

Using your own Twitch account for your chat bot is a bit more simple to set up in that you don't have to create another account with its own password. Just note that any messages you wish to allow the chat bot to send to your chat will appear as though it is coming from you.

Follow these instructions to get the proper requirements for using your own Twitch account as a chat bot:

1. Get an OAuth token by having one generated [here](http://twitchapps.com/tmi/)
2. Save this token somewhere safe temporarily as you'll need it later.

## Known Issues

- Extension doesn't allow specifying the file to put the highlight in. This is a work in progress.

## Release Notes

### 0.1.0

Pre-release version to gather feedback from the community and help identify gaps.

### 0.1.2

- Fix issues where commands were not registering. The cause was from node_modules not being included in the package.

### 0.1.3

- Cleaned up setting names
- Updated README with better instructions to get started (thanks @FletcherCodes)
- Updated icon used in the VS Code Marketplace for better contrast/visibility (thanks @parithon)
