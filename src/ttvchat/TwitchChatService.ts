import * as vscode from 'vscode';

import { HighlighterAPI } from '../index';
import { AuthenticationService } from './AuthenticationService';
import { Logger, log } from '../logger';
import { Commands, Configuration, Settings } from '../enums';
import { ChatClient, ChatClientMessageReceivedEvent } from './ChatClient';
import { parseMessage } from '../utils';

export class TwitchChatService implements vscode.Disposable {
  private readonly _api: HighlighterAPI;
  private readonly _authenticationService: AuthenticationService;

  private log: log;
  private loginStatusBarItem: vscode.StatusBarItem;
  private chatClientStatusBarItem: vscode.StatusBarItem;
  private chatClient: ChatClient;
  private config?: vscode.WorkspaceConfiguration;
  private signInCommand: vscode.Disposable;
  private signOutCommand: vscode.Disposable;
  private connectCommand: vscode.Disposable;
  private disconnectCommand: vscode.Disposable;

  constructor(api: HighlighterAPI, outputChannel: vscode.OutputChannel) {
    this.log = new Logger(outputChannel).log;
    this.chatClient = new ChatClient(this.log);
    this.chatClient.disconnect.bind(this.chatClient);

    this.config = vscode.workspace.getConfiguration(Configuration.sectionIdentifier);

    this._api = api;
    this._authenticationService = new AuthenticationService(this.log);
    this._authenticationService.signOutHandler.bind(this._authenticationService);

    this.loginStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    this.loginStatusBarItem.text = `$(sign-in) twitch`;
    this.loginStatusBarItem.command = Commands.signIn;
    this.loginStatusBarItem.tooltip = 'Twitch Line Highlighter Login';

    this.chatClientStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    this.chatClientStatusBarItem.text = `$(plug) disconnected`;
    this.chatClientStatusBarItem.command = Commands.connect;
    this.chatClientStatusBarItem.tooltip = 'Twitch Line Highlighter Chat Bot';

    this.signInCommand = vscode.commands.registerCommand(Commands.signIn, this._authenticationService.signInHandler, this._authenticationService);
    this.signOutCommand = vscode.commands.registerCommand(Commands.signOut, this.onSignOutHandler, this);

    this.connectCommand = vscode.commands.registerCommand(Commands.connect, this.chatClient.connect, this.chatClient);
    this.disconnectCommand = vscode.commands.registerCommand(Commands.disconnect, this.chatClient.disconnect, this.chatClient);
  }

  public async initialize(context: vscode.ExtensionContext): Promise<void> {
    this.log('ttvchat initializing...');

    context.subscriptions.push(
      this.loginStatusBarItem,
      this.chatClientStatusBarItem,
      this.signInCommand,
      this.signOutCommand,
      this.connectCommand,
      this.disconnectCommand,

      vscode.workspace.onDidChangeConfiguration(this.onDidChangeConfigurationHandler, this),

      this._authenticationService.onAuthStatusChanged(this.onAuthStatusChangedHandler, this),

      this.chatClient.onChatClientConnected(this.onChatClientConnectedHandler, this),
      this.chatClient.onChatClientMessageReceived(this.onChatClientMessageReceivedHandler, this)
    );


    this.chatClient.initialize(context);
    await this._authenticationService.initialize();

    this.log('ttvchat initialized.');
  }

  private onDidChangeConfigurationHandler(event: vscode.ConfigurationChangeEvent) {
    if (!event.affectsConfiguration(Configuration.sectionIdentifier)) {
      return;
    }
    this.config = vscode.workspace.getConfiguration(Configuration.sectionIdentifier);
  }

  private onAuthStatusChangedHandler(signedIn: boolean) {
    if (signedIn) {
      vscode.window.showInformationMessage('Twitch token has been saved.');
      this.loginStatusBarItem.hide();
      this.chatClientStatusBarItem.show();
    }
    else {
      this.chatClient.disconnect();
      this.loginStatusBarItem.show();
      this.chatClientStatusBarItem.hide();
    }
  }

  private onChatClientConnectedHandler(isConnected: boolean) {
    if (isConnected) {
      this.chatClientStatusBarItem.text = '$(plug) connected';
      this.chatClientStatusBarItem.command = Commands.disconnect;
    }
    else {
      this.chatClientStatusBarItem.text = '$(plug) disconnected';
      this.chatClientStatusBarItem.command = Commands.connect;
      const unhighlightOnDisconnect = this.config!.get<boolean>(Settings.unhighlightOnDisconnect) || false;
      if (unhighlightOnDisconnect) {
        this._api.requestUnhighlightAll('twitch');
      }
    }
  }

  private onChatClientMessageReceivedHandler(event: ChatClientMessageReceivedEvent) {
    const userName = event.userState.username!;
    const result = parseMessage(event.message);
    if (result) {
      if (result.highlight) {
        this._api.requestHighlight('twitch', userName, result.startLine, result.endLine, result.comments);
      }
      else {
        this._api.requestUnhighlight('twitch', userName, result.startLine);
      }
    }
  }

  private onSignOutHandler() {
    // Disconnect from the chat
    this.chatClient.disconnect();
    // Sign out of Twitch
    this._authenticationService.signOutHandler();
  }

  public async dispose() {
    await this.chatClient.disconnect();
    this.loginStatusBarItem.dispose();
    this.chatClientStatusBarItem.dispose();
    this.signInCommand.dispose();
    this.signOutCommand.dispose();
    this.connectCommand.dispose();
    this.disconnectCommand.dispose();
  }
}
