import {
  TextDocument,
  Range,
  Position,
  EventEmitter,
  Event,
  TextDocumentContentChangeEvent,
  DecorationOptions
} from "vscode";
import { isString } from 'util';

import { Highlight } from './Highlight';

export interface HighlightCollection {
  fileName: string;
  highlights: Array<Highlight>;
}

export interface HighlightChangedEvent {
}

export class HighlightManager {
  private readonly _onHighlightsChanged: EventEmitter<HighlightChangedEvent> = new EventEmitter();
  private highlightCollection: Array<HighlightCollection> = [];

  public get onHighlightChanged(): Event<HighlightChangedEvent> {
    return this._onHighlightsChanged.event;
  }

  public GetHighlightCollection(): Array<HighlightCollection> {
    return this.highlightCollection;
  }

  public GetHighlightDetails(): string[] {
    if (this.highlightCollection.length > 0) {
      return this.highlightCollection
        .map(hc => hc.highlights.map(h => `${hc.fileName}: ${h.startLine}`))
        .reduce(s => s)
        .sort((hA, hB) => hB.localeCompare(hA));
    }
    return [];
  }

  public GetDecorations(fileName: string): DecorationOptions[] {
    const idx = this.highlightCollection.findIndex(hc => hc.fileName === fileName);
    if (idx > -1) {
      return this.highlightCollection[idx].highlights.map<DecorationOptions>(h => {
        return {
          hoverMessage: `From ${h.userName === 'self'? 'You' : h.userName} ${h.comments !== undefined ? h.comments : ''}`,
          range: h.range
        };
      });
    }
    return [];
  }

  public Add(document: TextDocument, userName: string, startLine: number, endLine?: number, comments?: string): Promise<void> {
    return new Promise(resolve => {

      if (!endLine) {
        endLine = startLine;
      }
  
      const range = new Range(
        new Position(--startLine, 0),
        new Position(--endLine, document.lineAt(endLine).text.length)
      );
  
      const highlight = new Highlight(userName, range, comments);
  
      const idx = this.highlightCollection.findIndex(h => h.fileName === document.fileName);
      if (idx > -1) {
        if (!this.highlightCollection[idx].highlights.some(h => (h.userName === userName || userName === 'self') && h.startLine <= startLine && h.endLine >= endLine!)) {
          this.highlightCollection[idx].highlights.push(highlight);
        }
      }
      else {
        this.highlightCollection.push({
          fileName: document.fileName,
          highlights: [highlight]
        });
      }
  
      this._onHighlightsChanged.fire();
      resolve();
    });
  }

  public Remove(document: TextDocument, userName: string, lineNumber: number, deferRefresh?: boolean): Promise<void>;
  public Remove(fileName: string, userName: string, lineNumber: number, deferRefresh?: boolean): Promise<void>;
  public Remove(documentOrFileName: TextDocument | string, userName: string, lineNumber: number, deferRefresh: boolean = false): Promise<void> {
    return new Promise<void>(resolve =>{
      if (!isString(documentOrFileName)) {
        documentOrFileName = documentOrFileName.fileName;
      }
  
      const idx = this.highlightCollection.findIndex(h => h.fileName === documentOrFileName);
      if (idx > -1) {
        const hidx = this.highlightCollection[idx].highlights.findIndex(h => (h.userName === userName || userName === 'self') && h.startLine <= lineNumber && h.endLine >= lineNumber);
        if (hidx > -1) {
          this.highlightCollection[idx].highlights.splice(hidx, 1);
        }
        if (!deferRefresh) {
          this._onHighlightsChanged.fire();
        }
      }
      resolve();
    });
  }

  public Refresh() {
    this._onHighlightsChanged.fire();
  }

  public Clear(service?: string): Promise<void> {
    return new Promise<void>(resolve =>{
      if (service) {
        this.highlightCollection.forEach(hc => {
          const highlightsToRemove = hc.highlights.filter(h => h.userName.indexOf(`${service}:`) > -1);
          highlightsToRemove.forEach(h => {
            this.Remove(hc.fileName, h.userName, h.startLine, true);
          });
        });
      }
      else {
        this.highlightCollection = new Array<HighlightCollection>();
      }
      this._onHighlightsChanged.fire();
    });
  }

  public Rename(oldName: string, newName: string) {
    const idx = this.highlightCollection.findIndex(hc => hc.fileName === oldName);
    if (idx > -1) {
      this.highlightCollection[idx].fileName = newName;
    }
  }

  public UpdateHighlight(document: TextDocument, valueChanged: TextDocumentContentChangeEvent) {
    const idx = this.highlightCollection.findIndex(hc => hc.fileName === document.fileName);
    let updated = false;
    if (idx > -1) {
      // A carriage return was removed.
      if (valueChanged.text.length === 0 && valueChanged.range.end.line === valueChanged.range.start.line + 1) {
        let highlights = this.highlightCollection[idx].highlights.filter(h => h.range.start.line > valueChanged.range.end.line);
        highlights.forEach(highlight => {
          highlight.Update(new Range(
            new Position(highlight.range.start.line - 1, highlight.range.start.character),
            new Position(highlight.range.end.line, highlight.range.end.character)
          ));
          updated = true;
        });
        highlights = this.highlightCollection[idx].highlights.filter(h => h.range.end.line >= valueChanged.range.end.line);
        highlights.forEach(highlight => {
          highlight.Update(new Range(
            new Position(highlight.range.start.line, highlight.range.start.character),
            new Position(highlight.range.end.line - 1, highlight.range.end.character)
          ));
          updated = true;
        });
      }
      else if (valueChanged.text.match('\n')) {
        let highlights = this.highlightCollection[idx].highlights.filter(h => h.range.end.line >= valueChanged.range.start.line);
        highlights.forEach(highlight => {
          highlight.Update(new Range(
            new Position(highlight.range.start.line, highlight.range.start.character),
            new Position(highlight.range.end.line + 1, highlight.range.end.character)
          ));
          updated = true;
        });
        highlights = this.highlightCollection[idx].highlights.filter(h => h.range.start.line > valueChanged.range.start.line);
        highlights.forEach(highlight => {
          highlight.Update(new Range(
            new Position(highlight.range.start.line + 1, highlight.range.start.character),
            new Position(highlight.range.end.line, highlight.range.end.character)
          ));
          updated = true;
        });
      }
      else {
        const highlights = this.highlightCollection[idx].highlights.filter(h => h.range.contains(valueChanged.range));
        highlights.forEach(h => {
          if (valueChanged.text.length === 0) { // A character was deleted.
            h.Update(new Range(
              new Position(h.range.start.line, h.range.start.character),
              new Position(h.range.end.line, h.range.end.character - 1)
            ));
            updated = true;
          }
          else {
            h.Update(new Range(
              new Position(h.range.start.line, h.range.start.character),
              new Position(h.range.end.line, h.range.end.character + valueChanged.text.length)
            ));
            updated = true;
          }
        });
      }
    }
    if (updated) {
      this._onHighlightsChanged.fire();
    }
  }
}
