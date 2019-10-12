export declare function parseMessage(channel: string, userName: string, message: string): {
    twitchUser: string;
    startLine: number;
    endLine: number;
    fileName: string;
    comment: string;
} | undefined;
