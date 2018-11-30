import * as vscode from "vscode";

export class Highlight {
  constructor(
    public decorations: Array<{ range: vscode.Range }>,
    public editor: vscode.TextEditor,
    public twichUser?: string
  ) {}
}
