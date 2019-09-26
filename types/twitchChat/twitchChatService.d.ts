import * as vscode from 'vscode';
import { HighlighterAPI } from '../index';
export declare class TwitchChatService {
    private readonly _api;
    private readonly _authenticationService;
    private log;
    private loginStatusBarItem;
    private chatClientStatusBarItem;
    private chatClient;
    constructor(api: HighlighterAPI, outputChannel: vscode.OutputChannel);
    private createLoginStatusBarItem;
    private createChatClientStatusBarItem;
    initialize(context: vscode.ExtensionContext): Promise<void>;
}
