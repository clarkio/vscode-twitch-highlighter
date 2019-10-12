export declare class API {
    static isUserFollowingChannel(userId: string, channel: string): Promise<boolean>;
    static validateToken(token: string): Promise<{
        valid: boolean;
        login: string;
    }>;
    static revokeToken(token: string): Promise<boolean>;
}
