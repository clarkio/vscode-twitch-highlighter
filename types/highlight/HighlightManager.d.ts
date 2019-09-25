import { TextDocument, Event, TextDocumentContentChangeEvent, DecorationOptions } from "vscode";
import { Highlight } from './Highlight';
export interface HighlightCollection {
    fileName: string;
    highlights: Array<Highlight>;
}
export interface HighlightChangedEvent {
}
export declare class HighlightManager {
    private readonly _onHighlightsChanged;
    private highlightCollection;
    readonly onHighlightChanged: Event<HighlightChangedEvent>;
    GetHighlightCollection(): Array<HighlightCollection>;
    GetHighlightDetails(): string[];
    GetDecorations(fileName: string): DecorationOptions[];
    Add(document: TextDocument, userName: string, startLine: number, endLine?: number, comments?: string): void;
    Remove(document: TextDocument, userName: string, lineNumber: number, deferRefresh?: boolean): void;
    Remove(fileName: string, userName: string, lineNumber: number, deferRefresh?: boolean): void;
    Refresh(): void;
    Clear(service?: string): void;
    Rename(oldName: string, newName: string): void;
    UpdateHighlight(document: TextDocument, valueChanged: TextDocumentContentChangeEvent): void;
}
