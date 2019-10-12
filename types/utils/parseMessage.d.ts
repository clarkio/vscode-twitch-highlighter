export interface ParseMessageResult {
    highlight: boolean;
    startLine: number;
    endLine: number;
    fileName?: string;
    comments?: string;
}
export declare const parseMessage: (message: string) => ParseMessageResult | undefined;
