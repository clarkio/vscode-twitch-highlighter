'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { CredentialManager } from './credentialManager';

import { App } from './app';
import { TwitchChatService } from './ttvchat';
import { Configuration } from './enums';
import { YouTubeChatService } from './ytchat/YouTubeChatService';

let app: App;
let ttvchat: TwitchChatService | undefined;
let ytchat: YouTubeChatService | undefined;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  // Remove the older credentials if they exist.
  CredentialManager.deleteTwitchToken();
  CredentialManager.deleteTwitchClientId();

  const outputChannel = vscode.window.createOutputChannel('Twitch Line Highlighter');

  app = new App(outputChannel);
  app.intialize(context);

  const config = vscode.workspace.getConfiguration(Configuration.sectionIdentifier)
  const enabledClients = config.get<string[]>(Configuration.enabledClients) || ["twitch", "youtube"];
  enableChatClients(enabledClients, outputChannel, context);

  // Reload the chat clients if the enabledClients changed.
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
      if (event.affectsConfiguration(Configuration.sectionIdentifier)) {
        const config = vscode.workspace.getConfiguration(Configuration.sectionIdentifier);
        const enabledClients = config.get<string[]>(Configuration.enabledClients) || ["twitch", "youtube"];
        enableChatClients(enabledClients, outputChannel, context);
      }
    })
  );

  return app.API;

}

function enableChatClients(enabledClients: string[], outputChannel: vscode.OutputChannel, context: vscode.ExtensionContext) {
  // If twitch is enabled, but hasn't been initialized
  if (enabledClients.includes("twitch") && !ttvchat) {
    ttvchat = new TwitchChatService(app.API, outputChannel);
    ttvchat.initialize(context);
  }
  // If twitch is not enabled, but has already been initialized
  // dispose of twitch.
  else if (!enabledClients.includes("twitch") && ttvchat) {
    ttvchat.dispose();
    ttvchat = undefined;
  }

  // If youtube is enabled, but hasn't been initialized
  if (enabledClients.includes("youtube") && !ytchat) {
    ytchat = new YouTubeChatService(app.API, outputChannel);
    ytchat.initialize(context);
  }
  // If youtube is not enabled, but has already been initialized
  // dispose of youtube.
  else if (!enabledClients.includes("youtube") && ytchat) {
    ytchat.dispose();
    ytchat = undefined;
  }
}

export function deactivate() {
  if (ttvchat) {
    ttvchat.dispose();
  }
  if (ytchat) {
    ytchat.dispose();
  }
}

export const editorHasDecorations = () => {
  return true;
}
