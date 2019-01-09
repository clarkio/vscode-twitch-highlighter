"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from "vscode-languageclient/lib/main";
import { Highlighter } from "./highlighter";

const highlightDecorationType = vscode.window.createTextEditorDecorationType({
  backgroundColor: "green",
  border: "2px solid white"
});
const emptyDecorationType = vscode.window.createTextEditorDecorationType({
  backgroundColor: "transparent",
  border: "0px"
});
let highlighters: Array<Highlighter> = new Array<Highlighter>();
let client: LanguageClient;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let serverModule = context.asAbsolutePath(path.join("out", "server.js"));
  let debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };
  let serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions
    }
  };
  let clientOptions: LanguageClientOptions = {
    // Register the server for everything
    documentSelector: ["*"],
    synchronize: {
      // Synchronize the setting section to the server
      configurationSection: "twitchhighlighter"
    }
  };

  client = new LanguageClient(
    "twitchChatLanguageServer",
    serverOptions,
    clientOptions
  );

  client.onReady().then(() => {
    client.onNotification("connected", () => {
      console.log("We have begun connection with the Language Server");
      vscode.window.showInformationMessage(
        "Twitch Highlighter: Chat Listener Connected."
      );
    });
    client.onNotification("error", (params: any) => {
      console.log("Error handling in extension from client has been reached");
      vscode.window.showErrorMessage(params.message);
    });
    client.onNotification("exited", () => {
      vscode.window.showInformationMessage(
        "Twitch Highlighter: Chat Listener Stopped"
      );
    });
    client.onNotification("highlight", (params: any) => {
      console.log(params);
      executeHighlight(params.line, params.twitchUser);
    });
  });

  // #region command registrations
  registerCommand(context, "twitchhighlighter.startChat", startChatHandler);
  registerCommand(context, "twitchhighlighter.stopChat", stopChatHandler);
  registerCommand(context, "twitchhighlighter.highlight", highlightHandler);
  registerCommand(
    context,
    "twitchhighlighter.unhighlightAll",
    unhighlightAllHandler
  );
  // #endregion command registrations

  // #region command handlers
  function highlightHandler() {
    vscode.window
      .showInputBox({ prompt: "Enter a line number" })
      .then(executeHighlight);
  }

  function unhighlightAllHandler() {
    vscode.window.visibleTextEditors.forEach(visibleEditor => {
      visibleEditor.setDecorations(highlightDecorationType, []);
    });
    highlighters = new Array<Highlighter>();
  }

  function startChatHandler() {
    vscode.window.showInformationMessage(
      "Twitch Highlighter: Starting Chat Listener..."
    );
    client.start();
  }

  function stopChatHandler() {
    vscode.window.showInformationMessage(
      "Twitch Highlighter: Stopping Chat Listener..."
    );
    client.stop();
  }
  // #endregion command handlers

  function executeHighlight(
    lineNumber: string | undefined,
    twitchUser: string = "self"
  ) {
    if (!lineNumber || isNaN(+lineNumber)) {
      return;
    }
    const lineNumberInt: number = parseInt(lineNumber);

    let editor = vscode.window.activeTextEditor;
    if (editor) {
      let doc = editor.document;
      let existingHighlighter = highlighters.find(highlighter => {
        return highlighter.editor.document.fileName === doc.fileName;
      });
      let range = getHighlightRange(lineNumber, doc);
      let decoration = { range, hoverMessage: `From @${twitchUser}` };
      addHighlight(
        existingHighlighter,
        decoration,
        editor,
        lineNumberInt,
        twitchUser
      );
    }
  }

  // Listen for active text editor so we don't lose any existing highlights
  let activeTextEditorListener = vscode.window.onDidChangeActiveTextEditor(
    activeEditor => {
      if (!activeEditor) {
        return;
      }

      let existingHighlight = highlighters.find(highlight => {
        return (
          highlight.editor.document.fileName === activeEditor.document.fileName
        );
      });
      if (existingHighlight) {
        activeEditor.setDecorations(
          highlightDecorationType,
          existingHighlight.decorations
        );
      }
    }
  );
  context.subscriptions.push(activeTextEditorListener);
}

function addHighlight(
  existingHighlighter: Highlighter | undefined,
  decoration: { range: vscode.Range; hoverMessage: string },
  editor: vscode.TextEditor,
  lineNumber: number,
  twitchUser: string
) {
  if (existingHighlighter) {
    // We have a new decoration for a highlight with decorations already in a file
    // Add the decoration (a.k.a. style range) to the existing highlight's decoration array
    // Reapply decoration type for updated decorations array in this highlight
    existingHighlighter.decorations.push(decoration);
    editor.setDecorations(
      highlightDecorationType,
      existingHighlighter.decorations
    );
  } else {
    // todo: for removing a highlight, find by linenumber, then update highlights array and editor.document decorations (how do we reset a single decoration and not all decorations?)
    highlighters.push(
      new Highlighter([decoration], editor, lineNumber, twitchUser)
    );
    editor.setDecorations(highlightDecorationType, [decoration]);
  }
}

function getHighlightRange(lineNumber: string, doc: vscode.TextDocument) {
  // prefix string with plus (+) to make string a number
  // well at least that's what codephobia says :P
  const zeroIndexedLineNumber = +lineNumber - 1;
  // note: doc.lineAt is zero based index so remember to always do -1 from input
  let textLine = doc.lineAt(zeroIndexedLineNumber);
  let textLineLength = textLine.text.length;
  let range = new vscode.Range(
    new vscode.Position(zeroIndexedLineNumber, 0),
    new vscode.Position(zeroIndexedLineNumber, textLineLength)
  );
  return range;
}

export function deactivate(): Thenable<void> {
  if (!client) {
    return Promise.resolve();
  }
  return client.stop();
}

function registerCommand(
  context: vscode.ExtensionContext,
  name: string,
  handler: () => void
) {
  let disposable = vscode.commands.registerCommand(name, handler);
  context.subscriptions.push(disposable);
}
