"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { Highlight } from "./highlight";

const decorationType = vscode.window.createTextEditorDecorationType({
  backgroundColor: "green",
  border: "2px solid white"
});
let highlights: Array<Highlight> = new Array<Highlight>();

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Listen for active text editor so we don't lose any existing highlights
  let activeTextEditorListener = vscode.window.onDidChangeActiveTextEditor(
    activeEditor => {
      if (!activeEditor) {
        return;
      }

      let existingHighlight = highlights.find(highlight => {
        return (
          highlight.editor.document.fileName === activeEditor.document.fileName
        );
      });
      if (existingHighlight) {
        activeEditor.setDecorations(
          decorationType,
          existingHighlight.decorations
        );
      }
    }
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let highlight = vscode.commands.registerCommand("extension.highlight", () => {
    vscode.window
      .showInputBox({ prompt: "Enter a line number" })
      .then(handleHighlight);
  });

  let unhighlightAll = vscode.commands.registerCommand(
    "extension.unhighlightAll",
    () => {
      vscode.window.visibleTextEditors.forEach(visibleEditor => {
        visibleEditor.setDecorations(decorationType, []);
      });
      highlights = new Array<Highlight>();
    }
  );

  function handleHighlight(lineNumber: string | undefined) {
    if (!lineNumber || isNaN(+lineNumber)) {
      return;
    }

    let editor = vscode.window.activeTextEditor;
    if (editor) {
      let doc = editor.document;
      let existingHighlight = highlights.find(highlight => {
        return highlight.editor.document.fileName === doc.fileName;
      });
      let range = getHighlightRange(lineNumber, doc);
      let decoration = { range };
      addHighlight(existingHighlight, decoration, editor);
    }
  }

  context.subscriptions.push(highlight);
  context.subscriptions.push(unhighlightAll);
  context.subscriptions.push(activeTextEditorListener);
}

function addHighlight(
  existingHighlight: Highlight | undefined,
  decoration: { range: vscode.Range },
  editor: vscode.TextEditor
) {
  if (existingHighlight) {
    existingHighlight.decorations.push(decoration);
    editor.setDecorations(decorationType, existingHighlight.decorations);
  } else {
    highlights.push(new Highlight([decoration], editor, "clarkio"));
    editor.setDecorations(decorationType, [decoration]);
  }
}

function getHighlightRange(lineNumber: string, doc: vscode.TextDocument) {
  // prefix string with plus to make string a number
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

// this method is called when your extension is deactivated
export function deactivate() {}
