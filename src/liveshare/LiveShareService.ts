import {
  Disposable,
  OutputChannel
} from 'vscode';

import { Logger, log } from '../logger';
import { HighlighterAPI } from '../api';
import { Vsls } from './Vsls';
import { Role, LiveShare, getApi, SessionChangeEvent } from 'vsls';

export class LiveShareService implements Disposable {
  private readonly _api: HighlighterAPI;
  private disposable: Disposable | undefined;
  private _guest: Vsls | undefined;
  private _host: Vsls | undefined;
  private log: log;
  private vsls: LiveShare | null = null;

  constructor(api: HighlighterAPI, outputChannel: OutputChannel) {
    this._api = api;
    this.log = new Logger(outputChannel).log;
    void this.initialize();
  }

  dispose() {
    if (this.disposable) {
      this.disposable.dispose();
    }

    if (this._host !== undefined) {
      this._host.dispose();
    }

    if (this._guest !== undefined) {
      this._guest.dispose();
    }
  }

  private async initialize() {
    try {
      this.vsls = await getApi();
      this.disposable = Disposable.from(
        this.vsls!.onDidChangeSession(this.onDidChangeSessionHandler, this)
      );
    }
    catch (ex) {
      this.log(ex);
    }
  }

  private async onDidChangeSessionHandler(e: SessionChangeEvent): Promise<void> {
    if (this._host !== undefined) {
      this._host.dispose();
    }

    if (this._guest !== undefined) {
      this._guest.dispose();
    }

    switch (e.session.role) {
      case Role.Host:
        this._host = await Vsls.share(this.vsls!, this._api);
        break;

      case Role.Guest:
        this._guest = await Vsls.connect(this.vsls!, this._api);
        break;
    }
  }

}
