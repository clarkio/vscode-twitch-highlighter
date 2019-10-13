import * as vscode from 'vscode';

import { HighlighterAPI, IHighlightRequested, IUnhighlightRequested, IUnhighlightAllRequested } from './api';
import { Commands, LogLevel, Configuration, Settings, AppContexts } from './enums';
import { Logger, log } from './logger';
import {
  HighlightManager,
  HighlightTreeItem,
  HighlightTreeDataProvider
} from './highlight';
import { EventEmitter } from 'events';

export class App implements vscode.Disposable {
  private readonly _highlightManager: HighlightManager;
  private readonly _highlightTreeDataProvider: HighlightTreeDataProvider;
  private readonly _onHighlightRequested: vscode.EventEmitter<IHighlightRequested> = new vscode.EventEmitter();
  private readonly _onUnhighlightRequested: vscode.EventEmitter<IUnhighlightRequested> = new vscode.EventEmitter();
  private readonly _onUnhighlightAllRequested: vscode.EventEmitter<IUnhighlightAllRequested> = new vscode.EventEmitter();

  private log: log;
  private highlightDecorationType: vscode.TextEditorDecorationType;
  private currentDocument?: vscode.TextDocument;
  private config?: vscode.WorkspaceConfiguration;

  constructor(outputChannel?: vscode.OutputChannel) {
    this.log = new Logger(outputChannel).log;
    this.config = vscode.workspace.getConfiguration(Configuration.sectionIdentifier);
    this.highlightDecorationType = this.createTextEditorDecorationType();
    this._highlightManager = new HighlightManager();
    this._highlightTreeDataProvider = new HighlightTreeDataProvider(this._highlightManager.GetHighlightCollection.bind(this._highlightManager));
  }

  public intialize(context: vscode.ExtensionContext) {
    this.log('Initializing line highlighter...');

    context.subscriptions.push(
      this._highlightManager.onHighlightChanged(this.onHighlightChangedHandler, this),

      vscode.window.onDidChangeVisibleTextEditors(this.onDidChangeVisibleTextEditorsHandler, this),
      vscode.window.onDidChangeActiveTextEditor(this.onDidChangeActiveTextEditorHandler, this),

      vscode.workspace.onDidChangeTextDocument(this.onDidChangeTextDocumentHandler, this),
      vscode.workspace.onDidChangeConfiguration(this.onDidChangeConfigurationHandler, this),

      vscode.window.registerTreeDataProvider('twitchHighlighterTreeView-explorer', this._highlightTreeDataProvider),
      vscode.window.registerTreeDataProvider('twitchHighlighterTreeView-debug', this._highlightTreeDataProvider),
      vscode.window.registerTreeDataProvider('twitchHighlighterTreeView', this._highlightTreeDataProvider),

      vscode.commands.registerCommand(Commands.refreshTreeView, this.refreshTreeviewHandler, this),

      vscode.commands.registerCommand(Commands.highlight, this.highlightHandler, this),
      vscode.commands.registerCommand(Commands.unhighlight, this.unhighlightHandler, this),
      vscode.commands.registerCommand(Commands.unhighlightSpecific, this.unhighlightSpecificHandler, this),
      vscode.commands.registerCommand(Commands.unhighlightAll, this.unhighlightAllHandler, this),
      vscode.commands.registerCommand(Commands.gotoHighlight, this.gotoHighlightHandler, this),

      vscode.commands.registerCommand(Commands.requestHighlight, this.requestHighlightHandler, this),
      vscode.commands.registerCommand(Commands.requestUnhighlight, this.requestUnhighlightHandler, this),
      vscode.commands.registerCommand(Commands.requestUnhighlightAll, this.requestUnhighlightAllHandler, this),

      vscode.commands.registerCommand(Commands.contextMenuUnhighlight, this.contextMenuUnhighlightHandler, this)
    );

    this.log('Initialized line highlighter.');
  }

  public API: HighlighterAPI = {
    requestHighlight(service: string, userName: string, startLine: number, endLine?: number, comments?: string) {
      vscode.commands.executeCommand(Commands.requestHighlight,
        service,
        userName,
        startLine,
        endLine,
        comments
      );
    },
    requestUnhighlight(service: string, userName: string, lineNumber: number) {
      vscode.commands.executeCommand(Commands.requestUnhighlight,
        service,
        userName,
        lineNumber
      );
    },
    requestUnhighlightAll(service: string) {
      vscode.commands.executeCommand(Commands.requestUnhighlightAll, service);
    },
    onHighlightRequested: this._onHighlightRequested.event,
    onUnhighlightRequested: this._onUnhighlightRequested.event,
    onUnhighlightAllRequested: this._onUnhighlightAllRequested.event
  };

  public async dispose() {
  }

  private onDidChangeTextDocumentHandler(event: vscode.TextDocumentChangeEvent): void {
    if (event.document.languageId === 'Log') {
      return;
    }
    // Determine if the change occured on a highlighted line, if it did then adjust the highlight.
    event.contentChanges.forEach(valueChanged => {
      this._highlightManager.UpdateHighlight(event.document, valueChanged);
    });

    // Determine if we changed the fileName of the currently active open document.
    if (this.currentDocument && event.document.fileName !== this.currentDocument.fileName) {
      this._highlightManager.Rename(this.currentDocument.fileName, event.document.fileName);
      this.currentDocument = event.document;
    }
  }

  private onDidChangeConfigurationHandler(event: vscode.ConfigurationChangeEvent): void {
    if (!event.affectsConfiguration(Configuration.sectionIdentifier)) {
      return;
    }
    this.config = vscode.workspace.getConfiguration(Configuration.sectionIdentifier);
    this.highlightDecorationType = this.createTextEditorDecorationType();
    this.refresh();
  }

  private onDidChangeVisibleTextEditorsHandler(editors: Array<vscode.TextEditor>): void {
    if (editors.length > 0) {
      editors.forEach(te => {
        te.setDecorations(
          this.highlightDecorationType,
          this._highlightManager.GetDecorations(te.document.fileName)
        );
      });
    }
  }

  /**
   * Sets the 'editorHasHighlights' to true or false.
   * The 'editorHasHighlights' context is used to determine if the
   * 'Remove Highlight' and 'Remove All Highlights' context menu items
   * are visible or not.
   */
  private setEditorHasHighlightsContext() {
    if (vscode.window.activeTextEditor) {
      const editor = vscode.window.activeTextEditor;
      if (this._highlightManager.GetDecorations(editor.document.fileName).length > 0) {
        vscode.commands.executeCommand('setContext', AppContexts.editorHasHighlights, true);
      } else {
        vscode.commands.executeCommand('setContext', AppContexts.editorHasHighlights, false);
      }
    }
  }

  private onDidChangeActiveTextEditorHandler(editor?: vscode.TextEditor): void {
    if (editor) {
      this.currentDocument = editor.document;
    }
    else {
      this.currentDocument = undefined;
    }
    this.setEditorHasHighlightsContext();
  }

  private refreshTreeviewHandler(): void {
    this._highlightTreeDataProvider.refresh();
  }

  private createTextEditorDecorationType(): vscode.TextEditorDecorationType {
    const configuration = vscode.workspace.getConfiguration(Configuration.sectionIdentifier);

    if (this.highlightDecorationType) {
      this.highlightDecorationType.dispose();
    }

    return vscode.window.createTextEditorDecorationType({
      backgroundColor: configuration.get<string>(Configuration.highlightBackgroundColor) || 'green',
      border: configuration.get<string>(Configuration.highlightBorderStyle) || '2px solid white',
      color: configuration.get<string>(Configuration.highlightForegroundColor) || 'white'
    });
  }

  private refresh(): void {
    this.setEditorHasHighlightsContext();
    vscode.window.visibleTextEditors.forEach(te => {
      te.setDecorations(
        this.highlightDecorationType,
        this._highlightManager.GetDecorations(te.document.fileName)
      );
    });
    this._highlightTreeDataProvider.refresh();
  }

  private onHighlightChangedHandler(): void {
    this.refresh();
  }

  private get isActiveTextEditor(): boolean {
    const editor = vscode.window.activeTextEditor;
    return (editor !== undefined &&
            editor.document.languageId !== 'log' &&
            editor.document.getText().length > 0);
  }

  private async highlightHandler(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!this.isActiveTextEditor) {
      vscode.window.showInformationMessage('The current open, and active text editor is either empty or not a valid target to highlight a line.');
      return;
    }

    try {
      const options: vscode.InputBoxOptions = {
        ignoreFocusOut: true,
        prompt: "Enter a line number"
      };
      const value = await vscode.window.showInputBox(options);
      if (value) {
        this._highlightManager.Add(editor!.document, 'self', +(value || 0));
      }
    }
    catch ( err ) {
      this.log(LogLevel.Error, err);
    }

  }

  private async unhighlightHandler(treeItem?: HighlightTreeItem): Promise<void> {
    if (treeItem) {
      const fileName = treeItem.fileName;
      const highlightLines = treeItem.highlights.map(h => h.startLine);
      highlightLines.forEach(line => {
        this._highlightManager.Remove(fileName, 'self', line, true);
      });
      this._highlightManager.Refresh();
    }
    else {
      try {
        const options: vscode.QuickPickOptions = {
          ignoreFocusOut: true
        };
        const value = await vscode.window.showQuickPick(this._highlightManager.GetHighlightDetails(), options);
        if (value) {
          const fileNameAndLineNumber = value.split(": ");
          const fileName = fileNameAndLineNumber[0];
          const lineNumber = fileNameAndLineNumber[1];
          this._highlightManager.Remove(fileName, 'self', +(lineNumber));
        }
      }
      catch ( err ) {
        this.log(LogLevel.Error, err);
      }
    }
  }

  private async unhighlightSpecificHandler(): Promise<void> {
    if (this._highlightManager.GetHighlightCollection().length === 0) {
      vscode.window.showInformationMessage(
        'There are no highlights to unhighlight'
      );
      return;
    }

    let pickerOptions: Array<string> = new Array<string>();
    const highlights = this._highlightManager.GetHighlightDetails();
    highlights.forEach(highlight => {
      pickerOptions = [ ...pickerOptions, highlight ];
    });

    try {
      const pickedOption = await vscode.window.showQuickPick(pickerOptions);
      if (!pickedOption) {
        this.log('A valid highlight was not selected.');
        return;
      }
      const [pickedFile, lineNumber] = pickedOption.split(': ');
      this._highlightManager.Remove(pickedFile, 'self', +(lineNumber));
    }
    catch ( err ) {
      this.log(LogLevel.Error, err);
    }
  }

  private unhighlightAllHandler(): void {
    this._highlightManager.Clear();
  }

  private async gotoHighlightHandler(lineNumber: number, fileName: string): Promise<void> {
    const document = await vscode.workspace.openTextDocument(fileName);
    if (document) {
      vscode.window.showTextDocument(document).then(editor => {
        lineNumber = lineNumber < 3 ? 2 : lineNumber;
        editor.revealRange(document.lineAt(lineNumber - 2).range);
      });
    }
  }

  private requestHighlightHandler(service: string, userName: string, startLine: number, endLine?: number, comments?: string, callerId?: string): void {
    const editor = vscode.window.activeTextEditor;
    if (!this.isActiveTextEditor) {
      this.log(LogLevel.Warning, `Could not highlight the line requested by ${service}:${userName}`);
      this.log(LogLevel.Warning, 'The current open, and active text editor is either empty or not a valid target to highlight a line.');
      return;
    }
    this._highlightManager.Add(editor!.document, `${service}:${userName}`, startLine, endLine || startLine, comments);
    this._onHighlightRequested.fire({service, userName, startLine, endLine, comments, callerId});
  }

  private requestUnhighlightHandler(service: string, userName: string, lineNumber: number, callerId?: string): void {
    const editor = vscode.window.activeTextEditor;
    if (!this.isActiveTextEditor) {
      this.log(LogLevel.Warning, `Could not unhighlight the line requested by ${service}:${userName}`);
      this.log(LogLevel.Warning, 'The current open, and active text editor is either empty or not a valid target to highlight a line.');
      return;
    }
    this._highlightManager.Remove(editor!.document, `${service}:${userName}`, lineNumber);
    this._onUnhighlightRequested.fire({service, userName, lineNumber, callerId});
  }

  private requestUnhighlightAllHandler(service: string, callerId?: string): void {
    this._highlightManager.Clear(service);
    this._onUnhighlightAllRequested.fire({service, callerId});
  }

  private contextMenuUnhighlightHandler() {
    if (vscode.window.activeTextEditor) {
      const lineNumber = vscode.window.activeTextEditor.selection.active.line;
      this._highlightManager.Remove(vscode.window.activeTextEditor.document, 'self', lineNumber + 1);
    }
  }
}
