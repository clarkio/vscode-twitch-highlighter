export declare class CredentialManager {
    private static service;
    private static clientIdIdentifier;
    private static passwordIdentifier;
    private static keytar;
    /**
     * @deprecated Included only so people can remove their previous Client ID.
     */
    static deleteTwitchClientId(): Promise<boolean>;
    static setPassword(value: string): Promise<void>;
    static deleteTwitchToken(): Promise<boolean>;
    static getTwitchToken(): Promise<string | null>;
    private static getPassword;
}
export default CredentialManager;
