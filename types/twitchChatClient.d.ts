import { Disposable } from 'vscode';
export declare class TwitchChatClient {
    private readonly _languageClient;
    private _isConnected;
    constructor(serverModule: string, disposables?: Disposable[]);
    /**
     * Called when a highlight request is made from chat
     * @param twitchUser The user that made the request
     * @param startLine The line number to start the highlight on
     * @param endLine The line number to end the highlight on
     * @param fileName The `TextDocument`s filename to highlight in
     * @param comments The comments to add to the decoration
     * this.onHighlight(params.twitchUser, params.startLine, params.endLine, params.fileName, params.comments);
     */
    onHighlight?: (twitchUser: string, startLine: number, endLine: number, fileName?: string, comments?: string) => void;
    /**
     * Called when an unhighlight request is made from chat
     * @param lineNumber The line number to unhighlight, the entire highlight is removed if the lineNumber exists in the highlight range.
     * @param fileName The `TextDocument`s filename to remove the highlight from
     */
    onUnhighlight?: (lineNumber: number, fileName?: string) => void;
    /**
     * Called when the chat client is connecting
     */
    onConnecting?: () => void;
    /**
     * Called when the chat client is connected
     */
    onConnected?: () => void;
    /**
     * Called when the chat client is disconnected
     */
    onDisconnected?: () => void;
    /**
     * Called when a user is banned in chat
     */
    onBannedUser?: (bannedUserName: string) => void;
    /**
     * Retrieves the connection status.
     */
    isConnected(): boolean;
    /**
     * Start the connection to Twitch IRC.
     * @param setTokenCallback The callback to execute when the Twitch user token is not set.
     */
    start(setTokenCallback: () => Promise<boolean>): Promise<void>;
    /**
     * Stop the connection to Twitch IRC
     */
    stop(): void;
    dispose(): Thenable<void>;
    private startListening;
    private verifyToken;
    private setup;
    private getServerOptions;
    private getClientOptions;
}
