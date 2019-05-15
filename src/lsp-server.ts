import {
  IPCMessageReader,
  IPCMessageWriter,
  createConnection,
  IConnection,
  TextDocumentSyncKind
} from 'vscode-languageserver/lib/main';

import { Commands } from './constants';
import { TwitchServer } from './server';

let connection: IConnection = createConnection(
  new IPCMessageReader(process),
  new IPCMessageWriter(process)
);

let server: TwitchServer;

connection.onInitialize(_ => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.None
    }
  };
}
);

connection.onRequest(Commands.startChat, async params => {
  server = new TwitchServer(params, connection.sendNotification);
  try {
    await server.connectAsync();
  }
  catch (error) {
    console.error('There was an issue connecting to Twitch');
    console.error(error);
    throw error;
  }
});

connection.onRequest(Commands.stopChat, async () => {
  if (!server) { return false; }
  try {
    await server.disconnectAsync();
  }
  catch (error) {
    console.error('There was an error disconnecting from Twitch');
    console.error(error);
    throw error;
  }
  return true;
});

connection.onShutdown(async () => {
  connection.sendNotification('exited');
  if (!server) { return; }
  try {
    await server.disconnectAsync();
  }
  catch (error) {
    console.error('There was an error disconnecting from Twitch');
    console.error(error);
    throw error;
  }
});

connection.listen();
