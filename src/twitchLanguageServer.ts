import {
  IPCMessageReader,
  IPCMessageWriter,
  createConnection,
  IConnection,
  InitializeResult,
  InitializedParams,
  TextDocumentSyncKind
} from 'vscode-languageserver/lib/main';

import * as tmi from 'twitch-js';

let botparams: { announce: boolean; joinMessage: string; leaveMessage: string };
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

connection.onRequest('stopchat', async () => {
  if (!ttvChatClient) {
    return false;
  }
  if (botparams.announce && botparams.leaveMessage !== '') {
    await ttvChatClient.channels.forEach((channel: string) => {
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

connection.onRequest('startchat', params => {
  botparams = { ...params };
  ttvChatClient = new tmi.Client(getTwitchChatOptions(params));
  return ttvChatClient
    .connect()
    .then(() => {
      ttvChatClient.on('join', onTtvChatJoin);
      ttvChatClient.on('chat', onTtvChatMessage);
      return;
    })
    .catch((error: any) => {
      console.error('There was an issue connecting to Twitch');
      console.error(error);
      throw error;
    });
});

function onTtvChatJoin(channel: string, username: string, self: boolean) {
  if (self && botparams.announce && botparams.joinMessage !== '') {
    ttvChatClient.say(channel, botparams.joinMessage);
  }
}

function onTtvChatMessage(channel: string, user: any, message: string) {
  const userName = user['display-name'] || user.username;
  parseMessage(userName, message);
}

// let highlighterCommands = ['!line', '!highlight'];
// let highlightCommandUsed: string;

function parseMessage(userName: string, message: string) {

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
   * !line settings.json 5
   * !line settings.json !5
   * !line settings.json 5-15
   * !line settings.json !5-15
   * !line settings.json 5 including a comment
   * !line settings.json 5-15 including a comment
   * !line settings.json 5 5 needs a comment
   * !line 5 5 needs a comment
   * !line 5-7 6 should be deleted
   * !line settings.json 5-7 6 should be deleted
   * !highlight 5
   *
   */
  const commandPattern = /\!(?:line|highlight) (?:((?:[\w]+)?\.[\w]{1,}) )?(\!)?(\d+)(?:-{1}(\d+))?(?: (.+))?/;

  const cmdopts = commandPattern.exec(message);
  if (!cmdopts) { return; }

  const fileName: string = cmdopts[1];
  const highlight: boolean = cmdopts[2] === undefined;
  const startLine: number = +cmdopts[3];
  const endLine: number = cmdopts[4] ? +cmdopts[4] : +cmdopts[3];
  const comment: string | undefined = cmdopts[5];

  // Ensure that the startLine is smaller than the endLine.
  const vStartLine = endLine < startLine ? endLine : startLine;
  const vEndLine = endLine < startLine ? startLine : endLine;

  connection.sendNotification(
    highlight ? 'highlight' : 'unhighlight',
    {
      twitchUser: userName,
      startLine: vStartLine,
      endLine: vEndLine,
      fileName,
      comment
    }
  );

  // message = message.toLocaleLowerCase();
  // // Note: as RamblingGeek suggested might want to look into
  // // using switch instead of if/else for better performance
  // if (!isHighlightCommand(message)) {
  //   return;
  // }

  // const chatMessageRawAction = message
  //   .slice(highlightCommandUsed.length)
  //   .trim();

  // const messageParts = chatMessageRawAction.split(' ');
  // if (messageParts.length === 0) {
  //   // Example: !<command>
  //   return;
  // }

  // const notificationType = messageParts[0].startsWith('!')
  //   ? 'unhighlight'
  //   : 'highlight';
  // const lineNumber = messageParts[0].replace('!', '');
  // // Possible formats to support:
  // // !<command> <line number> <default to currently open file>
  // // !<command> <line number> <filename.ts>
  // // !<command> <line number> <filename.ts>
  // // !<command> <line number> <filename.ts>
  // // !<command> <line number> <filename.ts>
  // // !<command> !8 <filename.ts>
  // if (messageParts.length === 1) {
  //   // Example: !<command> <line number>
  //   connection.sendNotification(notificationType, {
  //     line: +lineNumber,
  //     twitchUser: userName
  //   });
  // } else {
  //   // Format Example: !<command> <line number> <filename.ts>
  //   // Other Example: !<command> <line number> <filename.ts> <color>
  //   connection.sendNotification(notificationType, {
  //     line: +lineNumber,
  //     filename: messageParts[1],
  //     twitchUser: userName
  //   });
  // }
}

// function isHighlightCommand(message: string) {
//   return highlighterCommands.some(
//     (command: string): boolean => {
//       const comparison = message.startsWith(command.toLowerCase());
//       highlightCommandUsed = comparison ? command : '';
//       return comparison;
//     }
//   );
// }

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
  channels: string[];
  nickname: string;
  clientId: string;
  password: string;
}): tmi.ClientOptions {
  return {
    channels: params.channels,
    connection: {
      secure: true,
      reconnect: true,
      maxReconnectAttempts: 5
    },
    identity: {
      username:
        !params.nickname || params.nickname === ''
          ? undefined
          : params.nickname,
      password: params.password
    },
    options: {
      debug: true /* True if you want DEBUG messages in your terminal; false otherwise */
    }
  };
}
