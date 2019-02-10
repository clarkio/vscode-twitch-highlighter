'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { Highlighter, Highlight } from './highlighter';
import CredentialManager from './credentialManager';
import {
  TwitchHighlighterDataProvider,
  HighlighterNode
} from './twitchHighlighterTreeView';
import { TwitchChatClient } from './twitchChatClient';

let highlightDecorationType: vscode.TextEditorDecorationType;
const twitchHighlighterStatusBarIcon: string = '$(plug)'; // The octicon to use for the status bar icon (https://octicons.github.com/)
let highlighters: Array<Highlighter> = new Array<Highlighter>();
let twitchCC: TwitchChatClient;
let twitchHighlighterTreeView: TwitchHighlighterDataProvider;
let twitchHighlighterStatusBar: vscode.StatusBarItem;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  setupDecoratorType();

  twitchCC = new TwitchChatClient(
    context.asAbsolutePath(path.join('out', 'twitchLanguageServer.js')),
    context.subscriptions
  );

  twitchCC.onHighlight = highlight;
  twitchCC.onUnhighlight = unhighlight;
  twitchCC.onConnected = () => setConnectionStatus(true);
  twitchCC.onConnecting = () => setConnectionStatus(false, true);
  twitchCC.onDisconnected = () => setConnectionStatus(false);

  twitchHighlighterTreeView = new TwitchHighlighterDataProvider(() => {
    return highlighters;
  });
  vscode.window.registerTreeDataProvider(
    'twitchHighlighterTreeView',
    twitchHighlighterTreeView
  );

  // Creates the status bar toggle button
  twitchHighlighterStatusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right
  );
  twitchHighlighterStatusBar.command = 'twitchHighlighter.toggleChat';
  twitchHighlighterStatusBar.tooltip = `Twitch Highlighter Extension`;
  context.subscriptions.push(twitchHighlighterStatusBar);

  setConnectionStatus(false);
  twitchHighlighterStatusBar.show();

  // #region command registrations
  registerCommand(context, 'twitchHighlighter.gotoHighlight', gotoHighlightHandler);
  registerCommand(context, 'twitchHighlighter.removeHighlight', removeHighlightHandler);
  registerCommand(context, 'twitchHighlighter.refreshTreeView', refreshTreeViewHandler);
  registerCommand(context, 'twitchHighlighter.removeTwitchClientId', removeTwitchClientIdHandler);
  registerCommand(context, 'twitchHighlighter.setTwitchPassword', setTwitchTokenHandler);
  registerCommand(context, 'twitchHighlighter.removeTwitchPassword', removeTwitchPasswordHandler);
  registerCommand(context, 'twitchHighlighter.startChat', startChatHandler);
  registerCommand(context, 'twitchHighlighter.stopChat', stopChatHandler);
  registerCommand(context, 'twitchHighlighter.toggleChat', toggleChatHandler);
  registerCommand(context, 'twitchHighlighter.highlight', highlightHandler);
  registerCommand(context, 'twitchHighlighter.unhighlightSpecific', unhighlightSpecificHandler);
  registerCommand(context, 'twitchHighlighter.unhighlightAll', unhighlightAllHandler);
  // #endregion command registrations

  // #region command handlers
  function gotoHighlightHandler(line: number, document: vscode.TextDocument) {
    vscode.window.showTextDocument(document).then(editor => {
      line = line < 3 ? 2 : line;
      editor.revealRange(document.lineAt(line - 2).range);
    });
  }

  function removeHighlightHandler(highlighterNode: HighlighterNode) {
    const highlightsToRemove = Array<{
      lineNumber: number;
      fileName: string;
    }>();
    highlighterNode.highlights.map(highlight =>
      highlightsToRemove.push({
        lineNumber: highlight.lineNumber,
        fileName: highlighterNode.document.fileName
      })
    );
    highlightsToRemove.forEach(v =>
      removeHighlight(v.lineNumber, v.fileName, true)
    );
    twitchHighlighterTreeView.refresh();
  }

  function refreshTreeViewHandler() {
    twitchHighlighterTreeView.refresh();
  }

  function removeTwitchClientIdHandler() {
    CredentialManager.deleteTwitchClientId()
      .then((value: boolean) => {
        vscode.window.showInformationMessage(
          `Twitch Chat Client Id removed from your keychain`
        );
      })
      .catch(reason => {
        vscode.window.showInformationMessage(
          `Failed to remove the Twitch Chat Client Id`
        );
        console.error(
          'An error occured while removing your Client Id from the keychain'
        );
        console.error(reason);
      });
  }

  async function setTwitchTokenHandler(): Promise<boolean> {
    const value = await vscode.window.showInputBox({
      prompt:
        'Enter Twitch token. Generate a token here: http://www.twitchapps.com/tmi',
      ignoreFocusOut: true,
      password: true
    });
    if (value === undefined || value === null) {
      return false;
    }
    await CredentialManager.setPassword(value)
      .then(() => {
        vscode.window.showInformationMessage(
          `Twitch Chat password saved in your keychain`
        );
      })
      .catch(reason => {
        vscode.window.showInformationMessage(
          `Failed to set Twitch Chat password`
        );
        console.error(
          'An error occured while saving your password to the keychain'
        );
        console.error(reason);
      });
    return true;
  }

  function removeTwitchPasswordHandler() {
    CredentialManager.deleteTwitchToken()
      .then((value: boolean) => {
        vscode.window.showInformationMessage(
          `Twitch Chat password removed from your keychain`
        );
      })
      .catch(reason => {
        vscode.window.showInformationMessage(
          `Failed to remove the Twitch Chat password`
        );
        console.error(
          'An error occured while removing your password from the keychain'
        );
        console.error(reason);
      });
  }

  function highlightHandler() {
    vscode.window
      .showInputBox({ prompt: 'Enter a line number' })
      .then((lineString) => highlight(+(lineString || 0), 'self'));
  }

  function unhighlightAllHandler() {
    vscode.window.visibleTextEditors.forEach(visibleEditor => {
      visibleEditor.setDecorations(highlightDecorationType, []);
    });
    highlighters = new Array<Highlighter>();
    twitchHighlighterTreeView.refresh();
  }

  function unhighlightSpecificHandler() {
    if (highlighters.length === 0) {
      vscode.window.showInformationMessage(
        'There are no highlights to unhighlight'
      );
    }
    let pickerOptions: Array<string> = new Array<string>();
    highlighters.forEach(highlighter => {
      pickerOptions = [...pickerOptions, ...highlighter.getPickerDetails()];
    });

    vscode.window.showQuickPick(pickerOptions).then(pickedOption => {
      if (!pickedOption) {
        vscode.window.showErrorMessage('A valid highlight was not selected.');
        return;
      }
      const [pickedFile, lineNumber] = pickedOption.split(', ');
      const lineNumberInt = parseInt(lineNumber);
      removeHighlight(lineNumberInt, pickedFile);
    });
  }

  function startChatHandler() {
    twitchCC.start(setTwitchTokenHandler);
  }

  function stopChatHandler() {
    twitchCC.stop();
  }

  function toggleChatHandler() {
    if (!twitchCC.isConnected()) {
      startChatHandler();
    } else {
      stopChatHandler();
    }
  }
  // #endregion command handlers

  // #region vscode events
  vscode.workspace.onDidChangeConfiguration(
    event => {
      if (event.affectsConfiguration('twitchHighlighter')) {
        setupDecoratorType();
      }
    },
    null,
    context.subscriptions
  );
  vscode.window.onDidChangeActiveTextEditor(
    editor => {
      activeEditor = editor;
      if (editor) {
        triggerUpdateDecorations();
      }
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidChangeTextDocument(
    document => {
      if (activeEditor && document.document === activeEditor.document) {
        triggerUpdateDecorations();
      }
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidCloseTextDocument(
    document => {
      if (document.isUntitled) {
        highlighters = highlighters.filter(
          highlight => highlight.editor.document !== document
        );
        triggerUpdateDecorations();
        twitchHighlighterTreeView.refresh();
      }
    },
    null,
    context.subscriptions
  );
  // #endregion  
}

export function deactivate(): Thenable<void> {
  if (!twitchCC) {
    return Promise.resolve();
  }
  return twitchCC.dispose();
}

function highlight(line: number, twitchUser: string) {
  console.log(`highlight called.`);
  if (!line) {
    vscode.window.showWarningMessage(
      'A line number was not provided to unhighlight'
    );
    return;
  }

  let editor = vscode.window.activeTextEditor;
  if (!editor) {
    console.log('No active text editor is present.');
    return;
  }

  const doc = editor.document;
  const existingHighlighter = highlighters.find(highlighter => {
    return highlighter.editor.document.fileName === doc.fileName;
  });

  // Do not highlight a line already requested by the same user.
  if (existingHighlighter && existingHighlighter.highlights.some(h => h.twitchUser === twitchUser && h.lineNumber === line)) {
    console.log(`An existing highlight already exists for '${twitchUser}' on line '${line}'`);
    return;
  }

  const range = getHighlightRange(line, doc);
  if (range.isEmpty) {
    /**
     * TODO: Maybe whisper to the end-user that the line requested is empty.
     * Although whispers aren't gaurenteed to reach the end-user.
     */
    console.log(`line '${line}' is empty. Cancelled.`);
    return;
  }

  const decoration = {
    range,
    hoverMessage: `From @${twitchUser === 'self' ? 'You' : twitchUser}`
  };

  addHighlight(
    existingHighlighter,
    decoration,
    editor,
    line,
    twitchUser
  );
}

function unhighlight(line: number, fileName: string) {
  console.log('unhighlight called.');
  if (!line) {
    vscode.window.showWarningMessage('A line number was not provided to unhighlight.');
    return;
  }

  let currentDocumentFileName: string;
  if (!fileName) {
    // We need to assume it's for the currently opened file
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('A file was not found to perform the unhighlight.');
      return;
    }
    currentDocumentFileName = editor.document.fileName;
  } else {
    const existingHighlighter = highlighters.find(highlighter => {
      return highlighter.editor.document.fileName.includes(fileName);
    });
    if (!existingHighlighter) {
      vscode.window.showWarningMessage('A file was not found to perform the unhighlight.');
      return;
    }
    currentDocumentFileName = existingHighlighter.editor.document.fileName;
  }

  removeHighlight(line, currentDocumentFileName);
}

// Listen for active text editor or document so we don't lose any existing highlights
let activeEditor = vscode.window.activeTextEditor;
if (activeEditor) {
  triggerUpdateDecorations();
}

function setConnectionStatus(
  connected: boolean,
  isConnecting?: boolean
) {
  if (connected) {
    twitchHighlighterStatusBar.text = `${twitchHighlighterStatusBarIcon} Connected`;
  } else {
    if (isConnecting) {
      twitchHighlighterStatusBar.text = `${twitchHighlighterStatusBarIcon} Connecting...`;
    } else {
      twitchHighlighterStatusBar.text = `${twitchHighlighterStatusBarIcon} Disconnected`;
    }
  }
}

function triggerUpdateDecorations() {
  if (!activeEditor) {
    return;
  }
  let existingHighlight = highlighters.find(highlight => {
    return (
      highlight.editor.document.fileName === activeEditor!.document.fileName
    );
  });
  if (existingHighlight) {
    activeEditor.setDecorations(
      highlightDecorationType,
      existingHighlight.getAllDecorations()
    );
  }
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
    existingHighlighter.addHighlight(
      new Highlight(decoration, lineNumber, twitchUser)
    );
  } else {
    const highlighter = new Highlighter(editor, [
      new Highlight(decoration, lineNumber, twitchUser)
    ]);
    highlighters.push(highlighter);
  }
  triggerUpdateDecorations();
  twitchHighlighterTreeView.refresh();
}

function removeHighlight(
  lineNumber: number,
  fileName: string,
  deferRefresh?: boolean
) {
  const existingHighlight = findHighlighter(fileName);
  if (!existingHighlight) {
    console.warn(
      `Highlight not found so can't unhighlight the line from file`
    );
    return;
  }

  existingHighlight.removeDecoration(lineNumber);
  triggerUpdateDecorations();
  if (!deferRefresh) {
    twitchHighlighterTreeView.refresh();
  }
}

function findHighlighter(fileName: string): Highlighter | undefined {
  return highlighters.find(highlighter => {
    return highlighter.editor.document.fileName === fileName;
  });
}

function getHighlightRange(line: number, doc: vscode.TextDocument) {
  // prefix string with plus (+) to make string a number
  // well at least that's what codephobia says :P
  // const zeroIndexedLineNumber = +lineNumber - 1;
  // note: doc.lineAt is zero based index so remember to always do -1 from input
  const zeroIndexedLineNumber = line - 1;
  let textLine = doc.lineAt(zeroIndexedLineNumber);
  let textLineLength = textLine.text.length;
  let range = new vscode.Range(
    new vscode.Position(zeroIndexedLineNumber, 0),
    new vscode.Position(zeroIndexedLineNumber, textLineLength)
  );
  return range;
}

function registerCommand(
  context: vscode.ExtensionContext,
  name: string,
  handler: (...params: any[]) => void
) {
  let disposable = vscode.commands.registerCommand(name, handler);
  context.subscriptions.push(disposable);
}

function setupDecoratorType() {
  const configuration = vscode.workspace.getConfiguration('twitchHighlighter');
  highlightDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: configuration.get<string>('highlightColor') || 'green',
    border: configuration.get<string>('highlightBorder') || '2px solid white'
  });
}
