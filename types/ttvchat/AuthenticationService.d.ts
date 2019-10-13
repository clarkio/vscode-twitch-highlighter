import { Event } from 'vscode';
import { log } from '../logger';
export declare class AuthenticationService {
    private log;
    private readonly _onAuthStatusChanged;
    readonly onAuthStatusChanged: Event<boolean>;
    private port;
    constructor(log: log);
    initialize(): Promise<void>;
    signInHandler(): Promise<void>;
    signOutHandler(): Promise<void>;
    private createServer;
}
