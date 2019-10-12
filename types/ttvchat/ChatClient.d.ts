import { Event, Disposable, ExtensionContext } from 'vscode';
import { ChatUserstate } from "tmi.js";
import { log } from '../logger';
export interface ChatClientMessageReceivedEvent {
    userState: ChatUserstate;
    message: string;
}
export declare class ChatClient implements Disposable {
    private log;
    private readonly _onChatClientConnected;
    private readonly _onChatClientMessageReceived;
    readonly onChatClientConnected: Event<boolean>;
    readonly onChatClientMessageReceived: Event<ChatClientMessageReceivedEvent>;
    private config?;
    private client?;
    private channel;
    private announceBot;
    private joinMessage;
    private leaveMessage;
    private requiredBadges;
    constructor(log: log);
    initialize(context: ExtensionContext): void;
    connect(): Promise<[string, number] | undefined>;
    disconnect(): Promise<void>;
    dispose(): Promise<void>;
    private readonly isConnected;
    private sendMessage;
    private onJoinHandler;
    private onConnectedHandler;
    private onMessageHandler;
    private onDidChangeConfigurationHandler;
}
