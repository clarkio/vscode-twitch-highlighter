import { Disposable, OutputChannel } from 'vscode';
import { HighlighterAPI } from '../api';
export declare class LiveShareService implements Disposable {
    private readonly _api;
    private disposable;
    private _guest;
    private _host;
    private log;
    private vsls;
    constructor(api: HighlighterAPI, outputChannel: OutputChannel);
    dispose(): void;
    private initialize;
    private onDidChangeSessionHandler;
}
