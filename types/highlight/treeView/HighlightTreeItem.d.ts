import { TreeItem, TreeItemCollapsibleState, Command } from "vscode";
import { Highlight } from "../highlight";
export declare class HighlightTreeItem extends TreeItem {
    readonly label: string;
    readonly fileName: string;
    readonly highlights: Highlight[];
    readonly collapsibleState: TreeItemCollapsibleState;
    readonly command?: Command | undefined;
    constructor(label: string, fileName: string, highlights: Highlight[], collapsibleState: TreeItemCollapsibleState, command?: Command | undefined);
    readonly description: string;
    readonly HighlightTreeItems: HighlightTreeItem[];
    contextValue: string;
}
