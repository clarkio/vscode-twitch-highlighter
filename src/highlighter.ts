import * as vscode from 'vscode';

export class Highlighter {
  public highlights: Array<Highlight> = new Array<Highlight>();

  constructor(
    public editor: vscode.TextEditor,
    highlights: Array<Highlight> | undefined
  ) {
    if (highlights) {
      this.highlights = highlights;
    }
  }

  addHighlight(highlight: Highlight): Highlight[] {
    this.highlights.push(highlight);
    return this.highlights;
  }

  getAllDecorations(): { range: vscode.Range }[] {
    return this.highlights.map(highlight => {
      return highlight.decoration;
    });
  }

  getPickerDetails() {
    return this.highlights.map(highlight => {
      return `${this.editor.document.fileName}, ${highlight.lineNumber}`;
    });
  }

  removeDecoration(lineNumber: number): Highlight[] {
    const highlightIndex = this.highlights.findIndex(highlight => {
      return highlight.lineNumber === lineNumber;
    });
    if (highlightIndex > -1) {
      return this.highlights.splice(highlightIndex, 1);
    }
    return this.highlights;
  }
}

export class Highlight {
  constructor(
    public decoration: { range: vscode.Range },
    public lineNumber: number,
    public twitchUser?: string
  ) {}
}
