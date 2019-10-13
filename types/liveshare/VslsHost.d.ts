import { Disposable } from "vscode";
import { LiveShare, SharedService } from "vsls";
import { HighlighterAPI } from "../api";
export declare class VslsHost implements Disposable {
    static ServiceId: string;
    static highlightNotification: 'highlight';
    static unhighlightNotification: 'unhighlight';
    static unhighlightAllNotification: 'unhighlightAll';
    static share(vsls: LiveShare, api: HighlighterAPI): Promise<VslsHost>;
    private readonly _disposable;
    private readonly _vsls;
    private readonly _service;
    private readonly _api;
    constructor(vsls: LiveShare, service: SharedService, api: HighlighterAPI);
    dispose(): void;
    private onHighlightRequestHandler;
    private onUnhighlightRequestHandler;
    private onUnhighlightAllRequestHandler;
    private isRequestFromMe;
    private onHighlightRequestedHandler;
    private onUnhighlightRequestedHandler;
    private onUnhighlightAllRequested;
}
