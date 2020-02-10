import * as vscode from 'vscode';
import { LiveChat } from 'youtube-chat';

import { log } from '../logger';
import { Configuration, LogLevel } from '../enums';
import { isNullOrUndefined } from 'util';
import { CommentItem } from 'youtube-chat/dist/parser';

export interface ChatClientMessageReceivedEvent {
  author: string;
  message: string;
}

export class ChatClient implements vscode.Disposable {

  private readonly _onChatClientConnected: vscode.EventEmitter<boolean> = new vscode.EventEmitter();
  private readonly _onChatClientMessageReceived: vscode.EventEmitter<ChatClientMessageReceivedEvent> = new vscode.EventEmitter();

  private config?: vscode.WorkspaceConfiguration;
  private client?: LiveChat;
  private liveId?: string;

  public readonly onChatClientConnected: vscode.Event<boolean> = this._onChatClientConnected.event;
  public readonly onChatClientMessageReceived: vscode.Event<ChatClientMessageReceivedEvent> = this._onChatClientMessageReceived.event;

  constructor(private log: log) {}

  public initialize(context: vscode.ExtensionContext) {
    this.config = vscode.workspace.getConfiguration(Configuration.sectionIdentifier);
    const channelId = this.config.get<string>(Configuration.youtubeChannelId) || "";
    if (isNullOrUndefined(channelId)) {
      this.log(LogLevel.Error, `YouTube channel id is not defined. Please double-check your settings.`);
      return;
    }
    this.client = new LiveChat({channelId: channelId});
    this.client.on('start', this.onChatClientStartedHandler.bind(this));
    this.client.on('end', this.onChatClientEndedHandler.bind(this));
    this.client.on('error', this.onChatClientErrorHandler.bind(this));
    this.client.on('comment', this.onChatClientCommentHandler.bind(this));
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(this.onDidChangeConfigurationHandler, this));
  }

  public async start() {
    if (this.client && this.liveId === undefined) {
      await this.client.start();
    }
  }

  public stop() {
    if (this.client && this.liveId !== undefined) {
      this.client.stop(`User Disconnect`);
    }
  }

  public async dispose() {
    if (this.client && this.client.liveId !== undefined) {
      await this.stop();
      this.client = undefined;
    }
  }

  private onDidChangeConfigurationHandler(event: vscode.ConfigurationChangeEvent) {
    if (event.affectsConfiguration(Configuration.sectionIdentifier)) {
      this.config = vscode.workspace.getConfiguration(Configuration.sectionIdentifier);
      const channelId = this.config.get<string>(Configuration.youtubeChannelId) || "";
      if (this.client && this.liveId !== undefined) {
        this.client.stop();
        this.client = new LiveChat({channelId: channelId});
        this.client.start();
      }
    }
  }

  private onChatClientStartedHandler(liveId: string) {
    this.log(`YouTube Started, liveId: ${liveId}`);
    this.liveId = liveId;
    this._onChatClientConnected.fire(true);
  }

  private onChatClientEndedHandler(reason?: string) {
    this.log(`YouTube disconnected reason: ${reason || "unknown"}`);
    this.liveId = undefined;
    this._onChatClientConnected.fire(false);
  }

  private onChatClientErrorHandler(error: Error) {
    this.log(LogLevel.Error, `ERROR (YouTube): ${error.message}`);
  }

  private onChatClientCommentHandler(comment: CommentItem) {
    let message = comment.message.map((m: any) => m.text + '\n').toLocaleString().trim();
    this.log(`Received: '${message}' from ${comment.author.name}`);

    if (!message) {
      return;
    }

    if (message.startsWith('!line') || message.startsWith('!highlight')) {
      // TODO: We cannot send messages right now because Google requires additional verification
      // before we are allowed access to the scopes required to send messages.
      this._onChatClientMessageReceived.fire({
        author: comment.author.name,
        message
      });
    }
  }
}
