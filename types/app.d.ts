import * as vscode from 'vscode';
import { HighlighterAPI } from './api';
export declare class App implements vscode.Disposable {
    private readonly _highlightManager;
    private readonly _highlightTreeDataProvider;
    private readonly _onHighlightRequested;
    private readonly _onUnhighlightRequested;
    private readonly _onUnhighlightAllRequested;
    private log;
    private highlightDecorationType;
    private currentDocument?;
    private config?;
    constructor(outputChannel?: vscode.OutputChannel);
    intialize(context: vscode.ExtensionContext): void;
    API: HighlighterAPI;
    dispose(): Promise<void>;
    private onDidChangeTextDocumentHandler;
    private onDidChangeConfigurationHandler;
    private onDidChangeVisibleTextEditorsHandler;
    /**
     * Sets the 'editorHasHighlights' to true or false.
     * The 'editorHasHighlights' context is used to determine if the
     * 'Remove Highlight' and 'Remove All Highlights' context menu items
     * are visible or not.
     */
    private setEditorHasHighlightsContext;
    private onDidChangeActiveTextEditorHandler;
    private refreshTreeviewHandler;
    private createTextEditorDecorationType;
    private refresh;
    private onHighlightChangedHandler;
    private readonly isActiveTextEditor;
    private highlightHandler;
    private unhighlightHandler;
    private unhighlightSpecificHandler;
    private unhighlightAllHandler;
    private gotoHighlightHandler;
    private requestHighlightHandler;
    private requestUnhighlightHandler;
    private requestUnhighlightAllHandler;
    private contextMenuUnhighlightHandler;
}
