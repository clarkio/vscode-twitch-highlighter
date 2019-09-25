'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import CredentialManager from './credentialManager';
import { TwitchChatClient } from './twitchChatClient';
import { isArray } from 'util';
import { extSuffix } from './constants';
import { Commands, Settings } from "./enums";
import { App } from './app';

const twitchHighlighterStatusBarIcon: string = '$(plug)'; // The octicon to use for the status bar icon (https://octicons.github.com/)
let twitchChatClient: TwitchChatClient;

let twitchHighlighterStatusBar: vscode.StatusBarItem;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const app = new App();
  app.intialize(context);

  updateChannelsSetting();

  twitchChatClient = new TwitchChatClient(
    context.asAbsolutePath(path.join('out', 'twitchLanguageServer.js')),
    context.subscriptions
  );

  // twitchChatClient.onHighlight = highlight;
  // twitchChatClient.onUnhighlight = unhighlight;
  // twitchChatClient.onBannedUser = handleBannedUser;
  twitchChatClient.onConnected = () => setConnectionStatus(true);
  twitchChatClient.onConnecting = () => setConnectionStatus(false, true);
  twitchChatClient.onDisconnected = () => {
    setConnectionStatus(false);
  };

  // Creates the status bar toggle button
  twitchHighlighterStatusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
  );
  twitchHighlighterStatusBar.command = Commands.toggleChat;
  twitchHighlighterStatusBar.tooltip = `Twitch Highlighter Extension`;
  context.subscriptions.push(twitchHighlighterStatusBar);

  setConnectionStatus(false);
  twitchHighlighterStatusBar.show();

  // #region command registrations
  registerCommand(
    context,
    Commands.removeTwitchClientId,
    removeTwitchClientIdHandler
  );
  registerCommand(context, Commands.setTwitchToken, setTwitchTokenHandler);
  registerCommand(
    context,
    Commands.removeTwitchToken,
    removeTwitchTokenHandler
  );
  registerCommand(context, Commands.startChat, startChatHandler);
  registerCommand(context, Commands.stopChat, stopChatHandler);
  registerCommand(context, Commands.toggleChat, toggleChatHandler);
  // #endregion command registrations

  // #region command handlers
  function removeTwitchClientIdHandler() {
    CredentialManager.deleteTwitchClientId()
      .then((value: boolean) => {
        vscode.window.showInformationMessage(
          `Twitch Chat Client Id removed from your keychain`
        );
      })
      .catch(reason => {
        vscode.window.showInformationMessage(
          `Failed to remove the Twitch Chat Client Id`
        );
        console.error(
          'An error occured while removing your Client Id from the keychain'
        );
        console.error(reason);
      });
  }

  /**
   * This function handles removing any highlights that were created from a user that was banned in chat
   * @param bannedUserName name of the user that was banned in the chat
   */
  // function handleBannedUser(bannedUserName: string) {
  // }

  async function setTwitchTokenHandler(): Promise<boolean> {
    const value = await vscode.window.showInputBox({
      prompt:
        'Enter Twitch token. Generate a token here: http://www.twitchapps.com/tmi',
      ignoreFocusOut: true,
      password: true
    });
    if (value === undefined || value === null) {
      return false;
    }
    await CredentialManager.setPassword(value)
      .then(() => {
        vscode.window.showInformationMessage(
          `Twitch Chat token saved in your keychain`
        );
      })
      .catch(reason => {
        vscode.window.showInformationMessage(
          `Failed to set Twitch Chat token`
        );
        console.error(
          'An error occured while saving your token to the keychain'
        );
        console.error(reason);
      });
    return true;
  }

  function removeTwitchTokenHandler() {
    CredentialManager.deleteTwitchToken()
      .then((value: boolean) => {
        vscode.window.showInformationMessage(
          `Twitch Chat token removed from your keychain`
        );
      })
      .catch(reason => {
        vscode.window.showInformationMessage(
          `Failed to remove the Twitch Chat token`
        );
        console.error(
          'An error occured while removing your token from the keychain'
        );
        console.error(reason);
      });
  }

  function startChatHandler() {
    twitchChatClient.start(setTwitchTokenHandler);
  }

  async function stopChatHandler() {
    const config = vscode.workspace.getConfiguration(extSuffix);
    let unhighlightOnDisconnect = config.get<boolean>(
      Settings.unhighlightOnDisconnect
    );

    // if (
    //   highlighters.length > 0 &&
    //   highlighters.some(h => h.highlights.length > 0) &&
    //   !unhighlightOnDisconnect
    // ) {
    //   const result = await vscode.window.showInformationMessage(
    //     'Do you want to keep or remove the existing highlights when disconnecting from chat?',
    //     'Always Remove',
    //     'Remove',
    //     'Keep'
    //   );
    //   if (result && result === 'Remove') {
    //     unhighlightOnDisconnect = true;
    //   }
    //   if (result && result === 'Always Remove') {
    //     unhighlightOnDisconnect = true;
    //     config.update(Settings.unhighlightOnDisconnect, true, true);
    //   }
    // }

    if (unhighlightOnDisconnect) {
    }

    twitchChatClient.stop();
  }

  function toggleChatHandler() {
    if (!twitchChatClient.isConnected()) {
      startChatHandler();
    } else {
      stopChatHandler();
    }
  }
  // #endregion command handlers

  // #region vscode events
  // #endregion

  return app.API;
}

export function deactivate(): Thenable<void> {
  if (!twitchChatClient) {
    return Promise.resolve();
  }
  return twitchChatClient.dispose();
}

// Listen for active text editor or document so we don't lose any existing highlights
function setConnectionStatus(connected: boolean, isConnecting?: boolean) {
  if (connected) {
    twitchHighlighterStatusBar.text = `${twitchHighlighterStatusBarIcon} Connected`;
  } else {
    if (isConnecting) {
      twitchHighlighterStatusBar.text = `${twitchHighlighterStatusBarIcon} Connecting...`;
    } else {
      twitchHighlighterStatusBar.text = `${twitchHighlighterStatusBarIcon} Disconnected`;
    }
  }
}

/**
 * Registers a command that can be invoked via a keyboard shortcut, a menu item, an action, or directly.
 * @param context The Extension context
 * @param name The unique name of the command
 * @param handler The callback function for the command
 * @param thisArgs The `this` context used when invoking the handler function.
 */
function registerCommand(
  context: vscode.ExtensionContext,
  name: string,
  handler: (...args: any[]) => void,
  thisArgs?: any
) {
  let disposable = vscode.commands.registerCommand(name, handler, thisArgs);
  context.subscriptions.push(disposable);
}

/**
 * Used to upgrade the channels setting from an array of strings ['clarkio','parithon']
 * to a string 'clarkio, parithon'.
 */
function updateChannelsSetting() {
  const configuration = vscode.workspace.getConfiguration(extSuffix);
  const channels = configuration.get<string>(Settings.channels);
  if (isArray(channels)) {
    // Update the global settings
    configuration.update(Settings.channels, channels.join(', '), true);
  }
}
