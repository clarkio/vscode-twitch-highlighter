import { TreeDataProvider, Event, TreeItem } from "vscode";
import { HighlightTreeItem } from "./HighlightTreeItem";
import { HighlightCollection } from "../highlightManager";
export declare class HighlightTreeDataProvider implements TreeDataProvider<HighlightTreeItem> {
    private getHighlightCollections;
    private readonly _onDidChangeTreeData;
    constructor(getHighlightCollections?: () => HighlightCollection[]);
    readonly onDidChangeTreeData: Event<HighlightTreeItem | undefined>;
    refresh(): void;
    getTreeItem(element: HighlightTreeItem): TreeItem;
    getChildren(element?: HighlightTreeItem): Thenable<HighlightTreeItem[]>;
}
