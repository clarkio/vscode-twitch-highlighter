import {
  IPCMessageReader,
  IPCMessageWriter,
  createConnection,
  IConnection,
  InitializeResult,
  TextDocumentSyncKind
} from "vscode-languageserver";

let connection: IConnection = createConnection(
  new IPCMessageReader(process),
  new IPCMessageWriter(process)
);
// let workspaceRoot: string | null | undefined;

connection.onInitialize(
  (params): InitializeResult => {
    connection.sendNotification("connected");
    // workspaceRoot = params.rootPath;

    return {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.None
      }
    };
  }
);

connection.listen();

const irc = require("irc");

// interface Settings {
//   twitchlinehighlighter: TwitchLineHighlighterSettings;
// }

// These are the example settings we defined in the client's package.json
// file
interface TwitchLineHighlighterSettings {
  connect: boolean;
  server: string;
  nickname: string;
  channel: string;
  password: string;
  command: string;
  port: number;
}

function connectIRC(config: TwitchLineHighlighterSettings) {
  if (!config.connect) {
    return () => {};
  }

  let ircConfig: any = {
    channels: [config.channel],
    port: config.port
  };

  if (config.password.length !== 0) {
    ircConfig["password"] = config.password;
  }

  var client = new irc.Client(config.server, config.nickname, ircConfig);

  client.addListener("error", function(message: string) {
    console.log("error: ", message);
  });

  client.addListener("message", function(
    from: string,
    to: string,
    message: string
  ) {
    if (to[0] !== "#") {
      return;
    }
    console.log(`${from} says: "${message}"`);
  });

  return () => client.disconnect();
}

connection.onDidChangeConfiguration(change => {
  console.log("Configuration change detected. Reconnecting...");
  disconnect();
  disconnect = connectIRC(settings);
});

let settings: TwitchLineHighlighterSettings = {
  connect: true,
  server: "irc.chat.twitch.tv",
  port: 80,
  password: "",
  nickname: "clarkio",
  channel: "#clarkio",
  command: ":highlight"
};

let disconnect = connectIRC(settings);
