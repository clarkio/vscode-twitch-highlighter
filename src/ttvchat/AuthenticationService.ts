import { readFileSync } from 'fs';
import * as http from 'http';
import * as path from 'path';
import * as url from 'url';
import { v4 } from 'uuid';
import { env, Event, EventEmitter, extensions, Uri, window } from 'vscode';
import { keytar } from '../common';
import { extensionId } from '../constants';
import { KeytarKeys, LogLevel, TwitchKeys } from '../enums';
import { Log } from '../logger';
import { API } from './api';

export class AuthenticationService {
  private readonly _onAuthStatusChanged: EventEmitter<boolean> =
    new EventEmitter();
  public readonly onAuthStatusChanged: Event<boolean> =
    this._onAuthStatusChanged.event;
  private port: number = 5544;

  constructor(private log: Log) {}

  public async initialize() {
    if (keytar) {
      const accessToken = await keytar.getPassword(
        KeytarKeys.service,
        KeytarKeys.account
      );
      const userLogin = await keytar.getPassword(
        KeytarKeys.service,
        KeytarKeys.userLogin
      );

      if (accessToken && userLogin) {
        // Twitch access tokens should be validated on a recurring interval.
        await this.validateToken(accessToken);
        return;
      }
    }
    this._onAuthStatusChanged.fire(false);
  }

  // https://dev.twitch.tv/docs/authentication#validating-requests
  public async validateToken(accessToken: string) {
    await API.validateToken(accessToken);
    this._onAuthStatusChanged.fire(true);
    this.log('Twitch access token has been validated.');
    const hour = 1000 * 60 * 60;
    setInterval(this.validateToken, hour, accessToken); // Validate the token each hour
  }

  public async signInHandler() {
    if (keytar) {
      const accessToken = await keytar.getPassword(
        KeytarKeys.service,
        KeytarKeys.account
      );
      if (!accessToken) {
        const state = v4();
        this.createServer(state);

        env.openExternal(
          Uri.parse(
            `https://id.twitch.tv/oauth2/authorize?client_id=${TwitchKeys.clientId}` +
              `&redirect_uri=http://localhost:${this.port}` +
              `&response_type=token&scope=${TwitchKeys.scope}` +
              `&force_verify=true` +
              `&state=${state}`
          )
        );
      } else {
        const validResult = await API.validateToken(accessToken);
        if (validResult.valid) {
          this._onAuthStatusChanged.fire(true);
        }
      }
    }
  }

  public async signOutHandler() {
    if (keytar) {
      const token = await keytar.getPassword(
        KeytarKeys.service,
        KeytarKeys.account
      );
      if (token) {
        const revoked = await API.revokeToken(token);
        if (revoked) {
          window.showInformationMessage('Twitch token revoked successfully');
        }
      }
      keytar.deletePassword(KeytarKeys.service, KeytarKeys.account);
      keytar.deletePassword(KeytarKeys.service, KeytarKeys.userLogin);
    }
    this._onAuthStatusChanged.fire(false);
  }

  private createServer(state: string) {
    const filePath = path.join(
      extensions.getExtension(extensionId)!.extensionPath,
      'out',
      'ttvchat',
      'login',
      'index.htm'
    );
    this.log(
      LogLevel.debug,
      `Starting login server using filePath: ${filePath}.`
    );
    const file = readFileSync(filePath);
    if (file) {
      const server = http.createServer(async (req: any, res: any) => {
        const mReq = url.parse(req.url!, true);
        const mReqPath = mReq.pathname;

        if (mReqPath === '/') {
          res.writeHead(200, {
            'Content-Type': 'text/html', // eslint-disable-line @typescript-eslint/naming-convention
            'Cache-Control': 'no-cache', // eslint-disable-line @typescript-eslint/naming-convention
          });
          res.end(file);
        } else if (mReqPath === '/oauth') {
          const q: any = mReq.query;

          if (q.state !== state) {
            window.showErrorMessage(
              'Error while logging in. State mismatch error.'
            );
            await API.revokeToken(q.access_token);
            this._onAuthStatusChanged.fire(false);
            res.writeHead(500, 'Error while logging in. State mismatch error.');
            res.end();
            return;
          }

          const validationResult = await API.validateToken(q.access_token);
          if (keytar && validationResult.valid) {
            keytar.setPassword(
              KeytarKeys.service,
              KeytarKeys.account,
              q.access_token
            );
            keytar.setPassword(
              KeytarKeys.service,
              KeytarKeys.userLogin,
              validationResult.login
            );
            this._onAuthStatusChanged.fire(true);
          }

          res.writeHead(200, {
            'Content-Type': 'text/html', // eslint-disable-line @typescript-eslint/naming-convention
            'Cache-Control': 'no-cache', // eslint-disable-line @typescript-eslint/naming-convention
          });
          res.end(file);
        } else if (mReqPath === '/complete') {
          res.writeHead(200, {
            'Content-Type': 'text/html', // eslint-disable-line @typescript-eslint/naming-convention
            'Cache-Control': 'no-cache', // eslint-disable-line @typescript-eslint/naming-convention
          });
          res.end(file);
          setTimeout(() => server.close(), 3000);
        } else if (mReqPath === '/favicon.ico') {
          res.writeHead(204);
          res.end();
        }
      });

      server.listen(this.port, (err: any) => {
        this.log(LogLevel.error, err);
      });
    }
  }
}
