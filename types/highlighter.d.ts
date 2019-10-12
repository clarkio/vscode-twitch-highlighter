import * as vscode from 'vscode';
export declare class Highlighter {
    editor: vscode.TextEditor;
    highlights: Array<Highlight>;
    constructor(editor: vscode.TextEditor, highlights: Array<Highlight> | undefined);
    addHighlight(highlight: Highlight): Highlight[];
    getAllDecorations(): {
        range: vscode.Range;
    }[];
    getPickerDetails(): string[];
    removeDecoration(lineNumber: number): Highlight[];
    removeDecorations(username: string): Highlight[];
}
export declare class Highlight {
    decoration: {
        range: vscode.Range;
    };
    startLine: number;
    endLine: number;
    twitchUser?: string | undefined;
    constructor(decoration: {
        range: vscode.Range;
    }, startLine: number, endLine: number, twitchUser?: string | undefined);
}
