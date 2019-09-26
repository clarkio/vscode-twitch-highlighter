export declare class API {
    static validateToken(token: string): Promise<{
        valid: boolean;
        login: string;
    }>;
    static revokeToken(token: string): Promise<boolean>;
}
