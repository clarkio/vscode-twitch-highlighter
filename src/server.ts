import {
  IPCMessageReader,
  IPCMessageWriter,
  createConnection,
  IConnection,
  InitializeResult,
  InitializedParams,
  TextDocumentSyncKind
} from 'vscode-languageserver/lib/main';
import { TwitchCredentials } from './credentialManager';

const tmi = require('twitch-js');

let twitchCredentials: TwitchCredentials;
let ttvChatClient: any;

let connection: IConnection = createConnection(
  new IPCMessageReader(process),
  new IPCMessageWriter(process)
);
// let workspaceRoot: string | null | undefined;

connection.onInitialize(
  (params): InitializeResult => {
    // workspaceRoot = params.rootPath;
    twitchCredentials = params.initializationOptions.TwitchCredentials;
    ttvChatClient = new tmi.client(getTwitchChatOptions());

    return {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.None
      }
    };
  }
);

connection.onInitialized((params: InitializedParams) => {
  connection.sendNotification('connected');
  if (ttvChatClient) {
    ttvChatClient
      .connect(getTwitchChatOptions())
      .then(() => {
        ttvChatClient.on('join', onTtvChatJoin);
        ttvChatClient.on('chat', onTtvChatMessage);
      })
      .catch((error: any) => {
        console.error('There was an issue connecting to Twitch');
        console.error(error);
        connection.sendNotification('error', {
          message: 'Server started but failed to connect to Twitch chat'
        });
      });
  } else {
    console.error('Twitch Chat Client not initialized');
  }
});

connection.listen();

function onTtvChatJoin(channel: string, username: string, self: boolean) {
  console.log(`[${username} has JOINED the channel ${channel}`);
}

function onTtvChatMessage(channel: string, user: any, message: string) {
  const userName = user['display-name'] || user.username;
  const lowerCaseMessage = message.toLowerCase();
  console.log(`${userName}: ${lowerCaseMessage}`);
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
      line: lineNumber,
      twitchUser: userName
    });
  } else {
    // Format Example: !<command> <line number> <filename.ts>
    // Other Example: !<command> <line number> <filename.ts> <color>
    connection.sendNotification(notificationType, {
      line: lineNumber,
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
// interface Settings {
//   twitchhighlighter: TwitchHighlighterSettings;
// }

// These are the example settings we defined in the client's package.json
// file
interface TwitchHighlighterSettings {
  connect: boolean;
  server: string;
  nickname: string;
  channel: string;
  password: string;
  command: string;
  port: number;
}
connection.onShutdown(() => {
  connection.sendNotification('exited');

  ttvChatClient
    .disconnect()
    .then(() => {
      console.debug(`Successfully disconnected from the Twitch chat`);
    })
    .catch((error: any) => {
      console.error(`There was an error disconnecting from the Twitch chat`);
      console.error(error);
    });
});

connection.onDidChangeConfiguration(change => {
  // console.log("Configuration change detected. Reconnecting...");
  // disconnect();
  // disconnect = connectIRC(settings);
});

let settings: TwitchHighlighterSettings = {
  connect: true,
  server: 'irc.chat.twitch.tv',
  port: 80,
  password: '',
  nickname: 'clarkio',
  channel: '#clarkio',
  command: ':highlight'
};

// #region hide this for now
function getTwitchChatOptions() {
  return {
    channels: ['<your channel>'],
    connection: {
      reconnect: true
    },
    identity: {
      password: twitchCredentials.password
    },
    options: {
      clientId: twitchCredentials.clientId,
      debug: false
    }
  };
}
// #endregion
