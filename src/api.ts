import { Event } from 'vscode';

export interface IHighlightRequested {
  service: string;
  userName: string;
  startLine: number;
  endLine?: number;
  comments?: string;
  callerId?: string;
}

export interface IUnhighlightRequested {
  service: string;
  userName: string;
  lineNumber: number;
  callerId?: string;
}

export interface IUnhighlightAllRequested {
  service: string;
  callerId?: string;
}

export interface HighlighterAPI {
  /**
   * Call this function to request a new highlight within the open, active text document.
   * @param service The name of the service making the request, for example: twitch.
   * @param userName The user requesting the highlight.
   * @param startLine The start line used to highlight.
   * @param endLine The end line of the highlight (only if highlighting multiple lines).
   * @param comments The comment to add to the highlight.
   * @param callerId A unique identifier used to identify what API made the request.
   */
  requestHighlight(service: string, userName: string, startLine: number, endLine?: number, comments?: string, callerId?: string): void;
  /**
   * Call this function to request a highlight to be removed from the open, active text document.
   * @param service The name of the service making the request, for example: twitch.
   * @param userName The user requesting the unhighlight.
   * @param lineNumber A line number where the highlight exists.
   * @param callerId A unique identifier used to identify what API made the request.
   */
  requestUnhighlight(service: string, userName: string, lineNumber: number, callerId?: string): void;
  /**
   * Call this function to request that all the highlights requested from the service are removed.
   * @param service The name of the service making the request, for example: twitch.
   * @param callerId A unique identifier used to identify what API made the request.
   */
  requestUnhighlightAll(service: string, callerId?: string): void;
  /**
   * An event that fires when a highlight has been requested.
   * This is used to notify other add-ons that a highlight has
   * been requested. For example, the VSLS add-on.
   */
  onHighlightRequested: Event<IHighlightRequested>;
  /**
   * An event that fires when an unhighlight has been requested.
   * This is used to notify other add-ons that a highlight has
   * been requested to be removed. For example, the VSLS add-on.
   */
  onUnhighlightRequested: Event<IUnhighlightRequested>;
  /**
   * An event that fires when all highlights have been requsted to be removed.
   * This is used to notify other add-ons. For example. the VSLS add-on.
   */
  onUnhighlightAllRequested: Event<IUnhighlightAllRequested>;
}
