import { OutputChannel } from 'vscode';

import { LogLevel } from './enums';
import { isEnum } from './utils';

export type log = {
  (message: string, ...optionalParams: any[]): void;
  (level: LogLevel, message?: string, ...optionalParams: any[]): void;
};

export class Logger {
  private readonly _channel?: OutputChannel;

  constructor(outputChannel?: OutputChannel, thisArgs?: any) {
    this._channel = outputChannel;
    this.log = this.log.bind(thisArgs || this);
  }

  public log(message: string, ...optionalParams: any[]): void;
  public log(levelOrMessage: LogLevel | string, message?: string, ...optionalParams: any[]): void {
    const captains: any = console;

    let level;
    if (isEnum(levelOrMessage, LogLevel)) {
      level = levelOrMessage;
    }
    else {
      level = LogLevel.Information;
      message = levelOrMessage;
    }

    const getTime = (): {
      hours: string,
      minutes: string,
      seconds: string
    } => {
      const date = new Date();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      const prefix = (value: number): string => {
        return value < 10 ? `0${value}` : `${value}`;
      };
      return {
        hours: prefix(hours),
        minutes: prefix(minutes),
        seconds: prefix(seconds)
      };
    };

    const { hours, minutes, seconds } = getTime();
    const log = `[${hours}:${minutes}:${seconds}] ${message}`;

    captains[level](log, ...optionalParams);

    if (this._channel && level !== LogLevel.Debug) {
      this._channel.appendLine(log);
    }
  }
}
