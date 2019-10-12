import * as vscode from 'vscode';
import { HighlighterAPI } from '../index';
export declare class TwitchChatService implements vscode.Disposable {
    private readonly _api;
    private readonly _authenticationService;
    private log;
    private loginStatusBarItem;
    private chatClientStatusBarItem;
    private chatClient;
    private config?;
    constructor(api: HighlighterAPI, outputChannel: vscode.OutputChannel);
    initialize(context: vscode.ExtensionContext): Promise<void>;
    private onDidChangeConfigurationHandler;
    private onAuthStatusChangedHandler;
    private onChatClientConnectedHandler;
    private onChatClientMessageReceivedHandler;
    private onSignOutHandler;
    dispose(): Promise<void>;
}
