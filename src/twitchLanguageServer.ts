import {
  IPCMessageReader,
  IPCMessageWriter,
  createConnection,
  IConnection,
  InitializeResult,
  InitializedParams,
  TextDocumentSyncKind
} from 'vscode-languageserver/lib/main';
import { Commands, InternalCommands } from "./enums";

import * as tmi from 'tmi.js';

let botparams: {
  announce: boolean;
  joinMessage: string;
  leaveMessage: string;
  usageTip: string;
};
let ttvChatClient: tmi.Client;
let connection: IConnection = createConnection(
  new IPCMessageReader(process),
  new IPCMessageWriter(process)
);

connection.onInitialize(
  (params): InitializeResult => {
    return {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.None
      }
    };
  }
);
connection.onInitialized((params: InitializedParams) => {
  // connection.sendNotification('connected');
});

connection.listen();

connection.onRequest(Commands.stopChat, async () => {
  if (!ttvChatClient) {
    return false;
  }
  if (botparams.announce && botparams.leaveMessage !== '') {
    await ttvChatClient.getChannels().forEach((channel: string) => {
      ttvChatClient.say(channel, botparams.leaveMessage);
    });
  }
  return ttvChatClient
    .disconnect()
    .then(() => {
      return true;
    })
    .catch(error => {
      console.error(error);
      throw error;
    });
});

connection.onRequest(Commands.startChat, async params => {
  botparams = { ...params };
  ttvChatClient = tmi.Client(getTwitchChatOptions(params));
  try {
    await ttvChatClient.connect();
    ttvChatClient.on('join', onTtvChatJoin);
    ttvChatClient.on('chat', onTtvChatMessage);
    ttvChatClient.on('ban', onTtvBanUser);
  } catch (error) {
    console.error('There was an issue connecting to Twitch');
    console.error(error);
    throw error;
  }
});

function onTtvChatJoin(channel: string, username: string, self: boolean) {
  if (self && botparams.announce && botparams.joinMessage !== '') {
    ttvChatClient.say(channel, botparams.joinMessage);
  }
}

function onTtvChatMessage(
  channel: string,
  user: tmi.ChatUserstate,
  message: string
) {
  const userName = user['display-name'] || user.username || 'unknown';
  parseMessage(channel, userName, message);
}

function onTtvBanUser(channel: string, userName: string, reason: string) {
  connection.sendNotification(
    InternalCommands.removeBannedHighlights,
    userName.toLocaleLowerCase()
  );
}

export function parseMessage(
  channel: string,
  userName: string,
  message: string
) {
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
    if (botparams.usageTip && botparams.usageTip.length > 0) {
      ttvChatClient.say(channel, `/me ${botparams.usageTip}`);
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
    twitchUser: userName,
    startLine: vStartLine,
    endLine: vEndLine,
    fileName,
    comment
  };

  connection.sendNotification(
    highlight ? Commands.highlight : Commands.unhighlight,
    result
  );

  return result;
}

connection.onShutdown(() => {
  connection.sendNotification('exited');

  ttvChatClient
    .disconnect()
    .then(() => {
      console.log(`Successfully disconnected from the Twitch chat`);
    })
    .catch((error: any) => {
      console.error(`There was an error disconnecting from the Twitch chat`);
      console.error(error);
    });
});
function getTwitchChatOptions(params: {
  channels: string;
  username: string;
  clientId: string;
  token: string;
}): tmi.Options {
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
