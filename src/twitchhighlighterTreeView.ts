import * as vscode from 'vscode';
import * as path from 'path';
import { Highlighter, Highlight } from './highlighter';

export class TwitchHighlighterDataProvider
  implements vscode.TreeDataProvider<HighlighterNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    HighlighterNode | undefined
  > = new vscode.EventEmitter<HighlighterNode | undefined>();
  readonly onDidChangeTreeData: vscode.Event<HighlighterNode | undefined> = this
    ._onDidChangeTreeData.event;

  constructor(private getHighlighters = (): Highlighter[] => []) {}
  refresh(): void {
    console.log('Refreshing twitch highlighter tree view.');
    this._onDidChangeTreeData.fire();
  }
  getTreeItem(element: HighlighterNode): vscode.TreeItem {
    return element;
  }
  getChildren(element?: HighlighterNode): Thenable<HighlighterNode[]> {
    if (element) {
      const highlights = element.getHighlights();
      return Promise.resolve(highlights);
    }
    const currentHighlighters = this.getHighlighters().filter(
      highlighter => highlighter.highlights.length > 0
    );
    const highlighterNodes = new Array<HighlighterNode>();
    currentHighlighters.forEach(highlighter => {
      const highlights = highlighter.highlights;
      const document = highlighter.editor.document;
      const label = path.basename(highlighter.editor.document.fileName);
      console.log('fileName', document);
      highlighterNodes.push(
        new HighlighterNode(
          label,
          document,
          highlights,
          vscode.TreeItemCollapsibleState.Collapsed
        )
      );
    });
    return Promise.resolve(highlighterNodes);
  }
}

export class HighlighterNode extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly document: vscode.TextDocument,
    public readonly highlights: Highlight[] = [],
    public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode
      .TreeItemCollapsibleState.None,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
  }
  get description(): string {
    if (this.highlights.length > 0) {
      return `highlights: ${this.highlights.length}`;
    }
    return ``;
  }
  public getHighlights(): HighlighterNode[] {
    const childrenNodes = new Array<HighlighterNode>();
    this.highlights.forEach((highlight: Highlight) => {
      const label = `Line: ${highlight.lineNumber}`;
      const existingNode = childrenNodes.find(node => node.label === label);
      if (existingNode) {
        existingNode.highlights.push(highlight);
      } else {
        childrenNodes.push(
          new HighlighterNode(label, this.document, [highlight], undefined, {
            command: 'twitchHighlighter.gotoHighlight',
            title: '',
            arguments: [highlight.lineNumber, this.document]
          })
        );
      }
    });
    return childrenNodes;
  }
  contextValue = 'highlighterNode';
}
