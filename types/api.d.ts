export interface HighlighterAPI {
    /**
     * Call this function to request a new highlight within the open, active text document.
     * @param service The name of the service making the request, for example: twitch.
     * @param userName The user requesting the highlight.
     * @param startLine The start line used to highlight.
     * @param endLine The end line of the highlight (only if highlighting multiple lines).
     * @param comments The comment to add to the highlight.
     */
    requestHighlight(service: string, userName: string, startLine: number, endLine?: number, comments?: string): void;
    /**
     * Call this function to request a highlight to be removed from the open, active text document.
     * @param service The name of the service making the request, for example: twitch.
     * @param userName The user requesting the unhighlight.
     * @param lineNumber A line number where the highlight exists.
     */
    requestUnhighlight(service: string, userName: string, lineNumber: number): void;
    /**
     * Call this function to request that all the highlights requested from the service are removed.
     * @param service The name of the service making the request, for example: twitch.
     */
    requestUnhighlightAll(service: string): void;
}
