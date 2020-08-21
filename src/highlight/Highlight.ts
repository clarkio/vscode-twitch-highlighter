import { Range } from 'vscode';

export class Highlight {
  private _userName: string;
  private _range: Range;
  private _comments?: string;

  constructor(userName: string, range: Range, comments?: string) {
    this._userName = userName;
    this._range = range;
    this._comments = comments;
  }

  public get range(): Range {
    return this._range;
  }

  public get userName(): string {
    return this._userName;
  }

  // The textEditor start line is zero indexed.
  // We adjust to match the editors line numbers as shown to the user.
  public get startLine(): number {
    return this._range.start.line + 1;
  }

  // The textEditor end line is zero indexed.
  // We adjust to match the editors line numbers as shown to the user.
  public get endLine(): number {
    return this._range.end.line + 1;
  }

  public get comments(): string | undefined {
    return this._comments;
  }

  // The range should only be updated by the app
  // when changes occur in the TextEditor, such as a newline
  // is added above this highlight range.
  public Update(newRange: Range): void {
    this._range = newRange;
  }
}
