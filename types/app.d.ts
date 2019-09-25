import * as vscode from 'vscode';
import { HighlighterAPI } from './api';
export declare class App {
    private readonly _highlightManager;
    private readonly _highlightTreeDataProvider;
    private log;
    private highlightDecorationType;
    private currentDocument?;
    constructor();
    intialize(context: vscode.ExtensionContext): void;
    API: HighlighterAPI;
    private onDidChangeTextDocumentHandler;
    private onDidChangeConfigurationHandler;
    private onDidChangeVisibleTextEditorsHandler;
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
}
