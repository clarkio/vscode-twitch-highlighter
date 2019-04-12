import {
  LanguageClient,
  ServerOptions,
  LanguageClientOptions,
  TransportKind
} from 'vscode-languageclient';
import { workspace, window, Disposable } from 'vscode';
import CredentialManager from './credentialManager';
import { extSuffix, Settings, Commands, InternalCommands } from './constants';

export class TwitchChatClient {
  private readonly _languageClient: LanguageClient;
  private _isConnected: boolean = false;

  constructor(serverModule: string, disposables?: Disposable[]) {
    this._languageClient = new LanguageClient(
      'Twitch Chat Highlighter',
      this.getServerOptions(serverModule),
      this.getClientOptions()
    );

    this._languageClient.onReady().then(() => {
      this.setup();
    });

    const disposable = this._languageClient.start();
    if (disposables) {
      disposables.push(disposable);
    }
  }

  /**
   * Called when a highlight request is made from chat
   * @param twitchUser The user that made the request
   * @param startLine The line number to start the highlight on
   * @param endLine The line number to end the highlight on
   * @param fileName The `TextDocument`s filename to highlight in
   * @param comments The comments to add to the decoration
   * this.onHighlight(params.twitchUser, params.startLine, params.endLine, params.fileName, params.comments);
   */

  public onHighlight?: (
    twitchUser: string,
    startLine: number,
    endLine: number,
    fileName?: string,
    comments?: string
  ) => void;
  /**
   * Called when an unhighlight request is made from chat
   * @param lineNumber The line number to unhighlight, the entire highlight is removed if the lineNumber exists in the highlight range.
   * @param fileName The `TextDocument`s filename to remove the highlight from
   */
  public onUnhighlight?: (lineNumber: number, fileName?: string) => void;
  /**
   * Called when the chat client is connecting
   */
  public onConnecting?: () => void;
  /**
   * Called when the chat client is connected
   */
  public onConnected?: () => void;
  /**
   * Called when the chat client is disconnected
   */
  public onDisconnected?: () => void;

  /**
   * Called when a user is banned in chat
   */
  public onBannedUser?: (bannedUserName: string) => void;

  /**
   * Retrieves the connection status.
   */
  public isConnected() {
    return this._isConnected;
  }

  /**
   * Start the connection to Twitch IRC.
   * @param setTokenCallback The callback to execute when the Twitch user token is not set.
   */
  public async start(setTokenCallback: () => Promise<boolean>) {
    CredentialManager.getTwitchToken()
      .then(token => {
        if (!this.verifyToken(token, setTokenCallback)) {
          return;
        }
        if (token === null) {
          return;
        }
        window.showInformationMessage(
          'Twitch Highlighter: Starting Chat Listener...'
        );
        if (this.onConnecting) {
          this.onConnecting();
        }
        this.startListening(token);
      })
      .catch(err => {
        if (this.onDisconnected) {
          this.onDisconnected();
          this._isConnected = false;
          console.error(
            'An unhandled exception occured while connecting to the twitch chat client.',
            err
          );
          window.showErrorMessage('Twitch Highlighter: Unable to connect.');
        }
      });
  }

  /**
   * Stop the connection to Twitch IRC
   */
  public stop() {
    this._languageClient.sendRequest(Commands.stopChat).then(
      result => {
        if (!result) {
          window.showErrorMessage(
            'Twitch Highlighter: Unable to stop listening to chat.'
          );
          return;
        }
        if (this.onDisconnected) {
          this.onDisconnected();
          this._isConnected = false;
        }
        window.showInformationMessage(
          'Twitch Highlighter: Stopped listening to chat.'
        );
      },
      rejected => {
        console.error(
          'An unhandled error occured while disconnecting from Twitch chat.',
          rejected
        );
        window.showErrorMessage(
          'Twitch Highlighter: Unable to stop listening to chat'
        );
      }
    );
  }

  public dispose(): Thenable<void> {
    return this._languageClient.stop();
  }

  private async startListening(token: string) {
    const configuration = workspace.getConfiguration(extSuffix);
    const chatParams = {
      channels: configuration.get<string[]>(Settings.channels),
      username: configuration.get<string>(Settings.username),
      password: token,
      announce: configuration.get<boolean>(Settings.announceBot) || false,
      joinMessage: configuration.get<string>(Settings.joinMessage) || '',
      leaveMessage: configuration.get<string>(Settings.leaveMessage) || ''
    };
    this._languageClient.sendRequest(Commands.startChat, chatParams).then(
      result => {
        window.showInformationMessage(
          'Twitch Highlighter: Chat Listener Connected.'
        );
        if (this.onConnected) {
          this.onConnected();
          this._isConnected = true;
        }
      },
      rejected => {
        console.error(`Unable to connect to twitch chat irc.`, rejected);
        window.showErrorMessage('Twitch Highlighter: Unable to connect.');
        if (this.onDisconnected) {
          this._isConnected = false;
          this.onDisconnected();
        }
      }
    );
  }

  private async verifyToken(
    token: string | null,
    setTokenCallback: () => Promise<boolean>
  ): Promise<boolean> {
    if (token === null) {
      window
        .showInformationMessage(
          'Missing Twitch Token. Cannot start chat client.',
          'Set Token'
        )
        .then(async action => {
          if (action) {
            // The user did not click the 'cancel' button.
            // Set the password when null, if the result is false
            // (i.e. user cancelled) then cancel the connection
            if (token === null && !(await setTokenCallback())) {
              return;
            }
            this.start(setTokenCallback);
          }
        });
      return false;
    }
    return true;
  }

  private setup() {
    this._languageClient.onNotification('error', (params: any) => {
      console.error('An unhandled error from TwitchServer has been reached.');
      window.showErrorMessage(params.message);
    });

    this._languageClient.onNotification(Commands.highlight, (params: any) => {
      console.log('highlight requested.', params);
      if (this.onHighlight) {
        this.onHighlight(
          params.twitchUser,
          params.startLine,
          params.endLine,
          params.fileName,
          params.comment
        );
      }
    });

    this._languageClient.onNotification(Commands.unhighlight, (params: any) => {
      console.log('unhighlight requested.', params);
      if (this.onUnhighlight) {
        this.onUnhighlight(params.endLine, params.fileName);
      }
    });

    this._languageClient.onNotification(
      InternalCommands.removeBannedHighlights,
      (bannedUserName: string) => {
        if (this.onBannedUser) {
          this.onBannedUser(bannedUserName);
        }
      }
    );
  }

  private getServerOptions(serverModule: string): ServerOptions {
    return {
      run: {
        module: serverModule,
        transport: TransportKind.ipc
      },
      debug: {
        module: serverModule,
        transport: TransportKind.ipc,
        options: {
          execArgv: ['--nolazy', '--inspect=6009']
        }
      }
    };
  }

  private getClientOptions(): LanguageClientOptions {
    return {
      // Register the server for everything
      documentSelector: ['*'],
      synchronize: {
        // Synchronize the setting section to the server
        configurationSection: extSuffix
      }
    };
  }
}
