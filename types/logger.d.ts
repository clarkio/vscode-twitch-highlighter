import { OutputChannel } from 'vscode';
import { LogLevel } from './enums';
export declare type log = {
    (message: string, ...optionalParams: any[]): void;
    (level: LogLevel, message?: string, ...optionalParams: any[]): void;
};
export declare class Logger {
    private readonly _channel?;
    constructor(outputChannel?: OutputChannel, thisArgs?: any);
    log(message: string, ...optionalParams: any[]): void;
}
