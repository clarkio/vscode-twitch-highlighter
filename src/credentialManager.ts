import * as keytartype from 'keytar';
import { env } from 'vscode';

declare const __webpack_require__: typeof require;
declare const __non_webpack_require__: typeof require;

function getNodeModule<T>(moduleName: string): T | undefined {
  const r = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require;
  try {
    return r(`${env.appRoot}/node_modules.asar/${moduleName}`);
  }
  catch (err) {
    // Not in ASAR.
  }
  try {
    return r(`${env.appRoot}/node_modules/${moduleName}`);
  }
  catch (err) {
    // Not available
  }
  return undefined;
}

export interface TwitchCredentials {
  clientId: string;
  password: string;
}

export class CredentialManager {
  private static service: string = "vscode-twitch-highlighter";
  private static clientIdIdentifier: string = "twitchClientId";
  private static passwordIdentifier: string = "twitchToken";
  private static keytar: typeof keytartype | undefined = getNodeModule<typeof keytartype>('keytar');

  public static async setClientId(value: string): Promise<void> {
    if (CredentialManager.keytar && value !== null) {
      await CredentialManager.keytar.setPassword(CredentialManager.service, CredentialManager.clientIdIdentifier, value);
    }    
  }
  public static async deleteTwitchClientId(): Promise<boolean> {
    if(CredentialManager.keytar) {
      return await CredentialManager.keytar.deletePassword(CredentialManager.service, CredentialManager.clientIdIdentifier);
    }
    return false;
  }
  public static async setPassword(value: string): Promise<void> {
    if (CredentialManager.keytar && value !== null) {
      await CredentialManager.keytar.setPassword(CredentialManager.service, CredentialManager.passwordIdentifier, value);
    }
  }
  public static async deletePassword(): Promise<boolean> {
    if (CredentialManager.keytar) {
      return await CredentialManager.keytar.deletePassword(CredentialManager.service, CredentialManager.passwordIdentifier);
    }
    return false;
  }
  public static getTwitchCredentials(): Promise<TwitchCredentials | null> {
    return new Promise<TwitchCredentials | null>(async resolve => {
      const clientId = await CredentialManager.getPassword(CredentialManager.clientIdIdentifier);
      const password = await CredentialManager.getPassword(CredentialManager.passwordIdentifier);
      if (clientId === null || password === null) {
        resolve(null);
        return;
      }
      const twitchCredential: TwitchCredentials = {
        clientId,
        password
      };
      resolve(twitchCredential);
    });
  }

  private static async getPassword(account: string): Promise<string | null> {
    if (CredentialManager.keytar) {
      return await CredentialManager.keytar.getPassword(CredentialManager.service, account);
    }
    return null;
  }
}

export default CredentialManager;