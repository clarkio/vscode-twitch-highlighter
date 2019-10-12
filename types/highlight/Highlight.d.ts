import { Range } from 'vscode';
export declare class Highlight {
    private _userName;
    private _range;
    private _comments?;
    constructor(userName: string, range: Range, comments?: string);
    readonly range: Range;
    readonly userName: string;
    readonly startLine: number;
    readonly endLine: number;
    readonly comments: string | undefined;
    Update(newRange: Range): void;
}
