import * as request from 'request';

import { TwitchKeys } from '../../enums';

export class API {
  public static async validateToken(token: string) {
    const url = `https://id.twitch.tv/oauth2/validate`;
    const result = await new Promise<{valid: boolean, login: string}>((resolve, reject) => {
      request.get(url, {
        headers: {
          'Authorization': `OAuth ${token}`
        }
      }, (err: any, response: any, body: any) => {
        if (err) {
          reject(err);
        }
        else {
          if (response.statusCode === 200) {
            const json = JSON.parse(body);
            resolve({valid: true, login: json.login});
          }
          else {
            resolve({valid: false, login: ''});
          }
        }
      });
    });
    return result;
  }
  public static async revokeToken(token: string) {
    const url = `https://id.twitch.tv/oauth2/revoke?` +
      `client_id=${TwitchKeys.clientId}` +
      `&token=${token}`;
    const result = await new Promise<boolean>((resolve, reject) => {
      request.post(url, {auth: { 'bearer': token }}, (err, response) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(response.statusCode === 200);
        }
      });
    });
    return result;
  }
}
