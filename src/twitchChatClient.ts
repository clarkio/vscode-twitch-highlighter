import { LanguageClient, ServerOptions, LanguageClientOptions, TransportKind } from "vscode-languageclient";
import { workspace, window, Disposable } from 'vscode';
import CredentialManager from "./credentialManager";

export class TwitchChatClient {
  private readonly _languageClient: LanguageClient;
  private _isConnected: boolean = false;

  constructor(
    serverModule: string,
    disposables?: Disposable[]
  ) {
    
    this._languageClient = new LanguageClient(
      'Twitch Chat Highlighter', 
      this.getServerOptions(serverModule), 
      this.getClientOptions()
    );

    this._languageClient.onReady()
      .then(() => {
        this.setup();
      });

    const disposable = this._languageClient.start();
    if (disposables) {
      disposables.push(disposable);
    }
  }

  /**
   * Called when a highlight request is made from chat
   * @param line The line number to highlight
   * @param twitchUser The user that made the request
   */
  public onHighlight?: (line: number, twitchUser: string) => void;
  /**
   * Called when an unhighlight request is made from chat
   * @param line The line number to unhighlight
   * @param fileName The TextDocument's filename to remove the highlight from
   */
  public onUnhighlight?: (line: number, fileName: string) => void;
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
        if (!this.verifyToken(token, setTokenCallback)) { return; }
        window.showInformationMessage('Twitch Highlighter: Starting Chat Listener...');
        if (this.onConnecting) {
          this.onConnecting();
        }
        if(token === null) { return; }
        this.startListening(token);
      })
      .catch(err => {
        if (this.onDisconnected) {
          this.onDisconnected();
          this._isConnected = false;
          console.error('An unhandled exception occured while connecting to the twitch chat client.', err);
          window.showErrorMessage('Twitch Highlighter: Unable to connect.');
        }
      });
  }

  /**
   * Stop the connection to Twitch IRC
   */
  public stop() {
    this._languageClient.sendRequest('stopchat')
      .then(result => {
        if (!result) {
          window.showErrorMessage('Twitch Highlighter: Unable to stop listening to chat.');
          return;
        }
        if (this.onDisconnected) {
          this.onDisconnected();
          this._isConnected = false;
        }
        window.showInformationMessage('Twitch Highlighter: Stopped listening to chat.');
      }, rejected => {
        console.error('An unhandled error occured while disconnecting from Twitch chat.', rejected);
        window.showErrorMessage('Twitch Highlighter: Unable to stop listening to chat');
      });
  }

  public dispose(): Thenable<void> {
    return this._languageClient.stop();
  }

  private async startListening(token: string) {
    const configuration = workspace.getConfiguration('twitchHighlighter');
    const chatParams = {
      channels: configuration.get<string[]>('channels'),
      nickname: configuration.get<string>('nickname'),
      password: token,
      announce: configuration.get<boolean>('announceBot') || false,
      joinMessage: configuration.get<string>('joinMessage') || '',
      leaveMessage: configuration.get<string>('leaveMessage') || '' 
    };
    this._languageClient.sendRequest('startchat', chatParams)
      .then(result => {
        window.showInformationMessage('Twitch Highlighter: Chat Listener Conected.');
        if (this.onConnected) {
          this.onConnected();
          this._isConnected = true;
        }
      }, rejected => {
        console.error(`Unable to connect to twitch chat irc.`, rejected);
        window.showErrorMessage('Twitch Highlighter: Unable to connect.');
        if (this.onDisconnected) {
          this._isConnected = false;
          this.onDisconnected();
        }
      });
  }

  private async verifyToken(token: string | null, setTokenCallback: () => Promise<boolean>): Promise<boolean> {
    if (token === null) {
      window.showInformationMessage('Missing Twitch Token. Cannot start chat client.',
      'Set Token')
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

    this._languageClient.onNotification('highlight', (params: any) => {
      console.log('highlight requested.', params);
      if (this.onHighlight) {
        this.onHighlight(params.line, params.twitchUser);
      }
    });

    this._languageClient.onNotification('unhighlight', (params: any) => {
      console.log('unhighlight requested.', params);
      if (this.onUnhighlight) {
        this.onUnhighlight(params.line, params.fileName);
      }
    });

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
        configurationSection: 'twitchHighlighter'
      }
    };
  }

}