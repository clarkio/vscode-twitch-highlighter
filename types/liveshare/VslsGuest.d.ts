import { Disposable } from "vscode";
import { LiveShare, SharedServiceProxy } from "vsls";
import { HighlighterAPI } from "../api";
export declare class VslsGuest implements Disposable {
    static connect(vsls: LiveShare, api: HighlighterAPI): Promise<VslsGuest | undefined>;
    private readonly _disposable;
    private readonly _api;
    private readonly _vsls;
    private readonly _service;
    constructor(vsls: LiveShare, service: SharedServiceProxy, api: HighlighterAPI);
    dispose(): void;
    private onHighlightRequestHandler;
    private onUnhighlightRequestHandler;
    private onUnhighlightAllRequestHandler;
    private isRequestFromMe;
    private onHighlightRequestedHandler;
    private onUnhighlightRequestedHandler;
    private onUnhighlightAllRequested;
}
