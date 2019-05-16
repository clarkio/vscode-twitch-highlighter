import * as tmi from 'tmi.js';

import { InternalCommands, Commands } from '../enums';

export interface ITmiOptions {
  channels: string;
  username: string;
  clientId: string;
  token: string;
}

export interface IBotParams {
  announce: boolean;
  joinMessage: string;
  leaveMessage: string;
  usageTip: string;
}

export class TwitchServer {
  private readonly _twitchClient: tmi.Client;
  private readonly _botparams: IBotParams;
  private readonly _sendNotification: (method: string, params?: any) => void;
  constructor(params: any, sendNotification: (method: string, params?: any) => void) {
    this._sendNotification = sendNotification;
    this._botparams = { ...params };
    this._twitchClient = tmi.client(this._generateTmiOptions(params));
    this._twitchClient.on('join', this.onTwitchChatUserJoined.bind(this));
    this._twitchClient.on('chat', this.onTwitchChatUserSpoke.bind(this));
    this._twitchClient.on('ban', this.onTwitchChatUserBanned.bind(this));
  }
  public get twitchClient() {
    return this._twitchClient;
  }
  public async connectAsync(): Promise<[string, number]> {
    return await this._twitchClient.connect();
  }
  public async disconnectAsync(): Promise<[string, number]> {
    if (this._botparams.announce) {
      const channels = this._twitchClient.getChannels();
      channels.forEach(async (channel: string) => {
        await this._twitchClient.say(channel, this._botparams.leaveMessage);
      });
    }
    return await this._twitchClient.disconnect();
  }
  public parseMessage(channel: string, username: string, message: string) {
    /**
   * Regex pattern to verify the command is a highlight command without
   * any arguments. This will send a 'howto' message back on chat to
   * inform the users how to use the highlight command.
   *
   * Matches:
   *
   * !line
   */
    const commandOnlyPattern = /^!(?:line|highlight)$/i;
    if (commandOnlyPattern.exec(message)) {
      if (this._botparams.usageTip && this._botparams.usageTip.length > 0) {
        this._twitchClient.say(channel, `/me ${this._botparams.usageTip}`);
      }
      return;
    }

    /**
     * Regex pattern to verify the command is a highlight command
     * groups the different sections of the command.
     *
     * See `https://regexr.com/48gf0` for my tests on the pattern.
     *
     * Matches:
     *
     * !line 5
     * !line !5
     * !line 5-10
     * !line !5-15
     * !line settings.json 5 | !line 5 settings.json
     * !line settings.json !5 | !line !5 settings.json
     * !line settings.json 5-15 | !line 5-15 settings.json
     * !line settings.json !5-15 | !line !5-15 settings.json
     * !line settings.json 5 including a comment | !line 5 settings.json including a comment
     * !line settings.json 5-15 including a comment | !line 5-15 settings.json including a comment
     * !line settings.json 5 5 needs a comment | !line 5 settings.json 5 needs a comment
     * !line 5 5 needs a comment
     * !line 5-7 6 should be deleted
     * !line settings.json 5-7 6 should be deleted
     * !highlight 5
     *
     */
    const commandPattern = /\!(?:line|highlight) (?:((?:[\w]+)?\.?[\w]*) )?(\!)?(\d+)(?:-{1}(\d+))?(?: ((?:[\w]+)?\.[\w]{1,}))?(?: (.+))?/i;

    const cmdopts = commandPattern.exec(message);
    if (!cmdopts) {
      return;
    }

    const fileName: string = cmdopts[1] || cmdopts[5];
    const highlight: boolean = cmdopts[2] === undefined;
    const startLine: number = +cmdopts[3];
    const endLine: number = cmdopts[4] ? +cmdopts[4] : +cmdopts[3];
    const comment: string | undefined = cmdopts[6];

    // Ensure that the startLine is smaller than the endLine.
    const vStartLine = endLine < startLine ? endLine : startLine;
    const vEndLine = endLine < startLine ? startLine : endLine;

    const result = {
      twitchUser: username,
      startLine: vStartLine,
      endLine: vEndLine,
      fileName,
      comment
    };

    this._sendNotification(
      highlight ? Commands.highlight : InternalCommands.unhighlight,
      result
    );

    return result;
  }
  private onTwitchChatUserJoined(channel: string, username: string, self: boolean): void {
    if (self && this._botparams.announce && this._botparams.joinMessage !== '') {
      this._twitchClient.say(channel, this._botparams.joinMessage);
    }
  }
  private onTwitchChatUserSpoke(channel: string, userstate: tmi.ChatUserstate, message: string): void {
    const username = userstate['display-name'] || userstate.username || 'unknown';
    this.parseMessage(channel, username, message);
  }
  private onTwitchChatUserBanned(channel: string, username: string, reason: string) {
    this._sendNotification(InternalCommands.removeBannedHighlights, username.toLocaleLowerCase());
  }
  private _generateTmiOptions(params: ITmiOptions): tmi.Options {
    return {
      channels: params.channels.split(',').map(s => s.trim()),
      connection: {
        secure: true,
        reconnect: true,
        maxReconnectAttempts: 5
      },
      identity: {
        username:
          !params.username || params.username === ''
            ? undefined
            : params.username,
        password: params.token
      },
      options: {
        debug: true /* True if you want DEBUG messages in your terminal; false otherwise */
      }
    };
  }
}
