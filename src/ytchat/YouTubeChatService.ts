import * as vscode from 'vscode';

import { log, Logger } from '../logger';
import { HighlighterAPI } from '../api';
import { ChatClient } from './ChatClient';
import { Configuration, Settings, Commands } from '../enums';
import { ChatClientMessageReceivedEvent } from './ChatClient';
import { parseMessage } from '../utils';

export class YouTubeChatService implements vscode.Disposable {
  private readonly _api: HighlighterAPI;

  private log: log;
  private chatClientStatusBar: vscode.StatusBarItem;
  private chatClient: ChatClient;
  private config?: vscode.WorkspaceConfiguration;
  private connectCommand: vscode.Disposable;
  private disconnectCommand: vscode.Disposable;

  constructor(api: HighlighterAPI, outputChannel: vscode.OutputChannel) {
    this.log = new Logger(outputChannel).log;

    this.config = vscode.workspace.getConfiguration(Configuration.sectionIdentifier);

    this.chatClientStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    this.chatClientStatusBar.text = `$(plug) disconnected`;
    this.chatClientStatusBar.command = Commands.youtubeConnect;
    this.chatClientStatusBar.tooltip = "YouTube Line Highlighter Chat Listener";
    this.chatClientStatusBar.show();

    this.chatClient = new ChatClient(this.log);
    this.chatClient.stop.bind(this.chatClient);

    this.connectCommand = vscode.commands.registerCommand(Commands.youtubeConnect, this.chatClient.start, this.chatClient);
    this.disconnectCommand = vscode.commands.registerCommand(Commands.youtubeDisconnect, this.chatClient.stop, this.chatClient);

    this._api = api;
  }

  public async initialize(context: vscode.ExtensionContext): Promise<void> {
    this.log(`ytchat initializing...`);

    context.subscriptions.push(
      this.chatClientStatusBar,
      this.connectCommand,
      this.disconnectCommand,

      this.chatClient.onChatClientConnected(this.onChatClientConnectedHandler, this),
      this.chatClient.onChatClientMessageReceived(this.onChatClientMessageReceivedHandler, this),

      vscode.workspace.onDidChangeConfiguration(this.onDidChangeConfigurationHandler, this)
    )

    this.chatClient.initialize(context);

    this.log(`ytchat initialized.`);
  }

  public dispose() {
    this.chatClient.dispose();
    this.chatClientStatusBar.dispose();
    this.connectCommand.dispose();
    this.disconnectCommand.dispose();
  }

  private onDidChangeConfigurationHandler(event: vscode.ConfigurationChangeEvent) {
    if (!event.affectsConfiguration(Configuration.sectionIdentifier)) {
      return;
    }
    this.config = vscode.workspace.getConfiguration(Configuration.sectionIdentifier);
  }

  private onChatClientConnectedHandler(isConnected: boolean) {
    if (isConnected) {
      this.chatClientStatusBar.text = `$(plug) connected`;
      this.chatClientStatusBar.command = Commands.youtubeDisconnect;
    }
    else {
      this.chatClientStatusBar.text = `$(plug) disconnected`;
      this.chatClientStatusBar.command = Commands.youtubeConnect;
      const unhighlightOnDisconnect = this.config!.get<boolean>(Settings.unhighlightOnDisconnect) || false
      if (unhighlightOnDisconnect) {
        this._api.requestUnhighlightAll('youtube');
      }
    }
  }

  private onChatClientMessageReceivedHandler(event: ChatClientMessageReceivedEvent) {
    const userName = event.author;
    const result = parseMessage(event.message);
    if (result) {
      if (result.highlight) {
        this._api.requestHighlight('youtube', userName, result.startLine, result.endLine, result.comments);
      }
      else {
        this._api.requestUnhighlight('youtube', userName, result.startLine);
      }
    }
  }
}
