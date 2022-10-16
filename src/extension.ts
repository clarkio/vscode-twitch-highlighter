'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { CredentialManager } from './credentialManager';

import { App } from './app';
import { TwitchChatService } from './ttvchat';

let app: App;
let ttvchat: TwitchChatService;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Remove the older credentials if they exist.
  CredentialManager.deleteTwitchToken();
  CredentialManager.deleteTwitchClientId();

  const outputChannel = vscode.window.createOutputChannel(
    'Twitch Line Highlighter'
  );

  app = new App(outputChannel);
  ttvchat = new TwitchChatService(app.api, outputChannel);

  app.intialize(context);
  ttvchat.initialize(context);

  return app.api;
}

export function deactivate() {
  ttvchat.dispose();
}

export const editorHasDecorations = () => {
  return true;
};
