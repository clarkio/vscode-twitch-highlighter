'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { App } from './app';
import { TwitchChatService } from './ttvchat';

let app: App;
let ttvchat: TwitchChatService;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  const outputChannel = vscode.window.createOutputChannel('Line Highlighter');

  app = new App(outputChannel);
  ttvchat = new TwitchChatService(app.API, outputChannel);

  app.intialize(context);
  ttvchat.initialize(context);

  return app.API;

}

export function deactivate() {
  ttvchat.dispose();
}
