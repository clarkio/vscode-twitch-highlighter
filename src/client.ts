import { LanguageClient, ServerOptions, LanguageClientOptions, TransportKind } from "vscode-languageclient";
import { window } from 'vscode';

export class TwitchClient extends LanguageClient {
  private static GetServerOptions = (serverModule: string): ServerOptions => {
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
  private static GetClientOptions = (): LanguageClientOptions => {
    return {
      // Register the server for everything
      documentSelector: ['*'],
      synchronize: {
        // Synchronize the setting section to the server
        configurationSection: 'twitchHighlighter'
      }
    };
  }
  constructor(
    serverModule: string,
    private highlightCallback?: (line: number, twitchUser: string) => void,
    private unhighlightCallback?: (fileName: string, line: number) => void
  ) {
    super('Twitch Chat Highlighter', TwitchClient.GetServerOptions(serverModule), TwitchClient.GetClientOptions());
    this.setup();
  }
  
  private setup() {
        
    this.onNotification('error', (params: any) => {
      console.error('An unhandled error from TwitchServer has been reached.');
      window.showErrorMessage(params.message);
    });
    
    this.onNotification('highlight', (params: any) => {
      console.log('highlight called.', params);
      if (this.highlightCallback) {
        this.highlightCallback(params.line, params.twitchUser);
      }
    });
    
    this.onNotification('unhighlight', (params: any) => {
      console.log('unhighlight called.', params);
      if(this.unhighlightCallback) {
        this.unhighlightCallback(params.fileName, params.line);
      }
    });

  }

}