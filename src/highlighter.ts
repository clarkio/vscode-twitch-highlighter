import * as vscode from "vscode";

export class Highlighter {
  constructor(
    public decorations: Array<{ range: vscode.Range }>,
    public editor: vscode.TextEditor,
    public lineNumber: number,
    public twichUser?: string
  ) {}
}
