'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { CredentialManager } from './credentialManager';

import { App } from './app';
import { TwitchChatService } from './ttvchat';
import { LiveShareService } from './liveshare';

let app: App;
let ttvchat: TwitchChatService;
let liveshare: LiveShareService;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  // Remove the older credentials if they exist.
  CredentialManager.deleteTwitchToken();
  CredentialManager.deleteTwitchClientId();

  const outputChannel = vscode.window.createOutputChannel('Twitch Line Highlighter');

  app = new App(outputChannel);
  ttvchat = new TwitchChatService(app.API, outputChannel);
  liveshare = new LiveShareService(app.API, outputChannel);


  app.intialize(context);
  ttvchat.initialize(context);

  return app.API;

}

export function deactivate() {
  ttvchat.dispose();
  liveshare.dispose();
}

export const editorHasDecorations = () => {
  return true;
}
