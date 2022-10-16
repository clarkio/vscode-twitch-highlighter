import * as vscode from 'vscode';
import { Commands, Configuration, Settings } from '../enums';
import { HighlighterAPI } from '../index';
import { Log, Logger } from '../logger';
import { parseMessage } from '../utils';
import { AuthenticationService } from './AuthenticationService';
import { ChatClient, ChatClientMessageReceivedEvent } from './ChatClient';

export class TwitchChatService implements vscode.Disposable {
  private readonly _api: HighlighterAPI;
  private readonly _authenticationService: AuthenticationService;

  private log: Log;
  private loginStatusBarItem: vscode.StatusBarItem;
  private chatClientStatusBarItem: vscode.StatusBarItem;
  private chatClient: ChatClient;
  private config?: vscode.WorkspaceConfiguration;

  constructor(api: HighlighterAPI, outputChannel: vscode.OutputChannel) {
    this.log = new Logger(outputChannel).log;
    this.chatClient = new ChatClient(this.log);
    this.chatClient.disconnect.bind(this.chatClient);

    this.config = vscode.workspace.getConfiguration(
      Configuration.sectionIdentifier
    );

    this._api = api;
    this._authenticationService = new AuthenticationService(this.log);
    this._authenticationService.signOutHandler.bind(
      this._authenticationService
    );

    this.loginStatusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left
    );
    this.loginStatusBarItem.text = `$(sign-in) Twitch`;
    this.loginStatusBarItem.command = Commands.signIn;
    this.loginStatusBarItem.tooltip = 'Twitch Line Highlighter Login';

    this.chatClientStatusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left
    );
    this.chatClientStatusBarItem.text = `$(plug) Disconnected`;
    this.chatClientStatusBarItem.command = Commands.connect;
    this.chatClientStatusBarItem.tooltip = 'Twitch Line Highlighter Chat Bot';
  }

  public async initialize(context: vscode.ExtensionContext): Promise<void> {
    this.log('ttvchat initializing...');

    context.subscriptions.push(
      this.loginStatusBarItem,
      this.chatClientStatusBarItem,

      vscode.workspace.onDidChangeConfiguration(
        this.onDidChangeConfigurationHandler,
        this
      ),

      this._authenticationService.onAuthStatusChanged(
        this.onAuthStatusChangedHandler,
        this
      ),

      this.chatClient.onChatClientConnected(
        this.onChatClientConnectedHandler,
        this
      ),
      this.chatClient.onChatClientMessageReceived(
        this.onChatClientMessageReceivedHandler,
        this
      ),

      vscode.commands.registerCommand(
        Commands.signIn,
        this._authenticationService.signInHandler,
        this._authenticationService
      ),
      vscode.commands.registerCommand(
        Commands.signOut,
        this.onSignOutHandler,
        this
      ),

      vscode.commands.registerCommand(
        Commands.connect,
        this.chatClient.connect,
        this.chatClient
      ),
      vscode.commands.registerCommand(
        Commands.disconnect,
        this.chatClient.disconnect,
        this.chatClient
      )
    );

    this.chatClient.initialize(context);
    await this._authenticationService.initialize();

    this.log('ttvchat initialized.');
  }

  private onDidChangeConfigurationHandler(
    event: vscode.ConfigurationChangeEvent
  ) {
    if (!event.affectsConfiguration(Configuration.sectionIdentifier)) {
      return;
    }
    this.config = vscode.workspace.getConfiguration(
      Configuration.sectionIdentifier
    );
  }

  private onAuthStatusChangedHandler(signedIn: boolean) {
    if (signedIn) {
      this.loginStatusBarItem.hide();
      this.chatClientStatusBarItem.show();
    } else {
      this.chatClient.disconnect();
      this.loginStatusBarItem.show();
      this.chatClientStatusBarItem.hide();
    }
  }

  private onChatClientConnectedHandler(isConnected: boolean) {
    if (isConnected) {
      this.chatClientStatusBarItem.text = '$(plug) Connected';
      this.chatClientStatusBarItem.command = Commands.disconnect;
      this.chatClientStatusBarItem.tooltip =
        'Line Highlighter is connected to the chat room. Click to disconnect.';
    } else {
      this.chatClientStatusBarItem.text = '$(plug) Disconnected';
      this.chatClientStatusBarItem.command = Commands.connect;
      this.chatClientStatusBarItem.tooltip =
        'Line Highlighter is not connected to the chat room. Click to connect.';
      const unhighlightOnDisconnect =
        this.config!.get<boolean>(Settings.unhighlightOnDisconnect) || false;
      if (unhighlightOnDisconnect) {
        this._api.requestUnhighlightAll('twitch');
      }
    }
  }

  private onChatClientMessageReceivedHandler(
    event: ChatClientMessageReceivedEvent
  ) {
    const userName = event.userState.username!;
    const result = parseMessage(event.message);
    if (result) {
      if (result.highlight) {
        this._api.requestHighlight(
          'twitch',
          userName,
          result.startLine,
          result.endLine,
          result.comments
        );
      } else {
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
  }
}
