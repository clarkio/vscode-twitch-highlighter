import {
  Badges, ChatUserstate, Client,
  Options
} from "tmi.js";
import {
  ConfigurationChangeEvent, Disposable, Event, EventEmitter,




  ExtensionContext, workspace,
  WorkspaceConfiguration
} from 'vscode';
import { keytar } from "../common";
import { Configuration, KeytarKeys, LogLevel, Settings } from "../enums";
import { log } from '../logger';
import { API } from './api';


interface IBadges extends Badges {
  [key: string]: string | undefined;
  follower: string;
}

export interface ChatClientMessageReceivedEvent {
  userState: ChatUserstate;
  message: string;
}

export class ChatClient implements Disposable {
  private readonly _onChatClientConnected: EventEmitter<boolean> = new EventEmitter();
  private readonly _onChatClientMessageReceived: EventEmitter<ChatClientMessageReceivedEvent> = new EventEmitter();

  public readonly onChatClientConnected: Event<boolean> = this._onChatClientConnected.event;
  public readonly onChatClientMessageReceived: Event<ChatClientMessageReceivedEvent> = this._onChatClientMessageReceived.event;

  private config?: WorkspaceConfiguration;
  private client?: Client;
  private channel: string = "";
  private announceBot: boolean = true;
  private joinMessage: string = "";
  private leaveMessage: string = "";
  private requiredBadges: string[] = [];

  constructor(private log: log) { }

  public initialize(context: ExtensionContext) {
    this.config = workspace.getConfiguration(Configuration.sectionIdentifier);
    this.announceBot = this.config.get<boolean>(Settings.announceBot) || true;
    this.joinMessage = this.config.get<string>(Settings.joinMessage) || "";
    this.leaveMessage = this.config.get<string>(Settings.leaveMessage) || "";
    this.requiredBadges = this.config.get<string[]>(Settings.requiredBadges) || [];

    context.subscriptions.push(workspace.onDidChangeConfiguration(this.onDidChangeConfigurationHandler, this));
  }

  public async connect() {
    if (keytar && this.config && !this.isConnected) {
      const accessToken = await keytar.getPassword(KeytarKeys.service, KeytarKeys.account);
      const login = await keytar.getPassword(KeytarKeys.service, KeytarKeys.userLogin);
      if (accessToken && login) {
        this.channel = this.config.get<string>(Settings.channels) || login;
        const opts: Options = {
          identity: {
            username: login,
            password: accessToken
          },
          channels: this.channel.split(', ').map(c => c.trim())
        };
        this.client = Client(opts);
        this.client.on('connected', this.onConnectedHandler.bind(this));
        this.client.on('message', this.onMessageHandler.bind(this));
        this.client.on('join', this.onJoinHandler.bind(this));
        const status = await this.client.connect();
        this._onChatClientConnected.fire(true);
        return status;
      }
    }
  }

  public async disconnect() {
    if (this.isConnected) {
      if (this.announceBot && this.leaveMessage.length > 0) {
        await this.sendMessage(this.leaveMessage);
      }
      if (this.client) {
        await this.client.disconnect();
        this.client = undefined;
      }
      this._onChatClientConnected.fire(false);
    }
  }

  public async dispose() {
    await this.disconnect();
  }

  private get isConnected(): boolean {
    return this.client ? this.client.readyState() === 'OPEN' : false;
  }

  private async sendMessage(message: string) {
    if (this.isConnected && this.client) {
      await this.client.say(this.channel, message);
    }
  }

  private async onJoinHandler(channel: string, username: string, self: boolean) {
    if (self && this.client && this.announceBot && this.joinMessage.length > 0) {
      this.log(`Joined channel: ${channel} as ${username}`);
      await this.sendMessage(this.joinMessage);
    }
  }

  private onConnectedHandler(address: string, port: number) {
    this.log(`Connected chat client to ${address} port ${port}`);
  }

  private async onMessageHandler(channel: string, userState: ChatUserstate, message: string, self: boolean) {
    this.log(`Received '${message}' from ${userState["display-name"]}`);

    if (self) {
      return;
    }

    if (!message) {
      return;
    }

    const badges = userState.badges as IBadges || {};
    badges.follower = await API.isUserFollowingChannel(userState.id!, channel) === true ? '1' : '0';

    if (this.requiredBadges.length > 0 && !badges.broadcaster) {
      // Check to ensure the user has a required badge
      const canContinue = this.requiredBadges.some(badge => badges[badge] === '1');
      // Bail if the user does not have the required badge
      if (!canContinue) {
        this.log(LogLevel.Warning, `${userState.username} does not have any of the required badges to use the highlight command.`);
        return;
      }
    }

    message = message.toLocaleLowerCase().trim();

    if (message.startsWith('!line') || message.startsWith('!highlight')) {
      // message = message.replace('!line', '').replace('!highlight', '').trim();
      if (message.length === 0) {
        this.sendMessage('💡 To use the !line command, use the following format: !line <number> --or-- multiple lines: !line <start>-<end> --or-- with a comment: !line <number> <comment>');
        return;
      }
      this._onChatClientMessageReceived.fire({
        userState,
        message
      });
    }
  }

  private async onDidChangeConfigurationHandler(event: ConfigurationChangeEvent) {
    if (event.affectsConfiguration(Configuration.sectionIdentifier) && this.isConnected) {
      await this.disconnect();
      await this.connect();
    }
  }
}
