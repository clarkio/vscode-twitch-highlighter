import { TreeItem, TreeItemCollapsibleState, Command } from 'vscode';

import { Highlight } from '../Highlight';
import { Commands } from '../../enums';

export class HighlightTreeItem extends TreeItem {
  constructor(
    public readonly label: string,
    public readonly fileName: string,
    public readonly highlights: Highlight[] = [],
    public readonly collapsibleState: TreeItemCollapsibleState,
    public readonly command?: Command
  ) {
    super(label, collapsibleState);
  }

  // @ts-ignore
  public get description(): string {
    if (this.highlights.length > 0) {
      return `Highlights: ${this.highlights.length}`;
    }
    return '';
  }

  public get highlightTreeItems(): HighlightTreeItem[] {
    const children = new Array<HighlightTreeItem>();
    this.highlights.forEach((highlight) => {
      const label = `Line: ${
        highlight.endLine > highlight.startLine
          ? `${highlight.startLine} - ${highlight.endLine}`
          : `${highlight.startLine}`
      }`;
      const existingItem = children.find((item) => item.label === label);
      if (existingItem) {
        existingItem.highlights.push(highlight);
      } else {
        const command: Command = {
          command: Commands.gotoHighlight,
          title: '',
          arguments: [highlight.startLine, this.fileName],
        };
        children.push(
          new HighlightTreeItem(
            label,
            this.fileName,
            [highlight],
            TreeItemCollapsibleState.None,
            command
          )
        );
      }
    });
    return children;
  }

  contextValue = 'highlightTreeItem';
}
