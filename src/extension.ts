"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

const decorationType = vscode.window.createTextEditorDecorationType({
  backgroundColor: "green",
  border: "2px solid white"
});

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "twitch-line-highlighter" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "extension.highlight",
    () => {
      // The code you place here will be executed every time your command is executed
      // note: doc.lineAt is zero based index so remember to always do -1 from input
      // todo: toggle initiating separate background process that will listen and parse twitch chat
      // todo: codephobia: make sure we create a away to unhighlight
      // todo: teachtyle unhighlight based on timeout
      // todo
      vscode.window
        .showInputBox({ prompt: "Enter a line number" })
        .then(lineNumber => {
          if (lineNumber) {
            let editor = vscode.window.activeTextEditor;
            if (editor) {
              let doc = editor.document;
              // prefix string with plus to make string a number
              // well at least that's what codephobia says :P
              const zeroIndexedLineNumber = +lineNumber - 1;
              let textLine = doc.lineAt(zeroIndexedLineNumber);
              let textLineLength = textLine.text.length;

              let range = new vscode.Range(
                new vscode.Position(zeroIndexedLineNumber, 0),
                new vscode.Position(zeroIndexedLineNumber, textLineLength)
              );

              let decoration = { range };
              editor.setDecorations(decorationType, [decoration]);
            }
          }
        });
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
