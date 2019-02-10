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

let highlighterCommands = ['!line', '!highlight'];
let highlightCommandUsed: string;

function parseMessage(userName: string, message: string) {
  message = message.toLocaleLowerCase();
  // Note: as RamblingGeek suggested might want to look into
  // using switch instead of if/else for better performance
  if (!isHighlightCommand(message)) {
    return;
  }

  const chatMessageRawAction = message
    .slice(highlightCommandUsed.length)
    .trim();

  const messageParts = chatMessageRawAction.split(' ');
  if (messageParts.length === 0) {
    // Example: !<command>
    return;
  }

  const notificationType = messageParts[0].startsWith('!')
    ? 'unhighlight'
    : 'highlight';
  const lineNumber = messageParts[0].replace('!', '');
  // Possible formats to support:
  // !<command> <line number> <default to currently open file>
  // !<command> <line number> <filename.ts>
  // !<command> <line number> <filename.ts>
  // !<command> <line number> <filename.ts>
  // !<command> <line number> <filename.ts>
  // !<command> !8 <filename.ts>
  if (messageParts.length === 1) {
    // Example: !<command> <line number>
    connection.sendNotification(notificationType, {
      line: +lineNumber,
      twitchUser: userName
    });
  } else {
    // Format Example: !<command> <line number> <filename.ts>
    // Other Example: !<command> <line number> <filename.ts> <color>
    connection.sendNotification(notificationType, {
      line: +lineNumber,
      filename: messageParts[1],
      twitchUser: userName
    });
  }
}

function isHighlightCommand(message: string) {
  return highlighterCommands.some(
    (command: string): boolean => {
      const comparison = message.startsWith(command.toLowerCase());
      highlightCommandUsed = comparison ? command : '';
      return comparison;
    }
  );
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
