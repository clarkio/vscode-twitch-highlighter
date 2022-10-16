import * as keytartype from 'keytar';
import { env } from 'vscode';

declare const WEBPACK_REQUIRE: typeof require;
declare const NON_WEBPACK_REQUIRE: typeof require;

function getNodeModule<T>(moduleName: string): T | undefined {
  const r =
    typeof WEBPACK_REQUIRE === 'function' ? NON_WEBPACK_REQUIRE : require;
  try {
    return r(`${env.appRoot}/node_modules.asar/${moduleName}`);
  } catch (err) {
    // Not in ASAR.
  }
  try {
    return r(`${env.appRoot}/node_modules/${moduleName}`);
  } catch (err) {
    // Not available
  }
  return undefined;
}

export class CredentialManager {
  private static service: string = 'vscode-twitch-highlighter';
  private static clientIdIdentifier: string = 'twitchClientId';
  private static passwordIdentifier: string = 'twitchToken';
  private static keytar: typeof keytartype | undefined =
    getNodeModule<typeof keytartype>('keytar');

  /**
   * @deprecated Included only so people can remove their previous Client ID.
   */
  public static async deleteTwitchClientId(): Promise<boolean> {
    if (CredentialManager.keytar) {
      return await CredentialManager.keytar.deletePassword(
        CredentialManager.service,
        CredentialManager.clientIdIdentifier
      );
    }
    return false;
  }
  public static async setPassword(value: string): Promise<void> {
    if (CredentialManager.keytar && value !== null) {
      await CredentialManager.keytar.setPassword(
        CredentialManager.service,
        CredentialManager.passwordIdentifier,
        value
      );
    }
  }
  public static async deleteTwitchToken(): Promise<boolean> {
    if (CredentialManager.keytar) {
      return await CredentialManager.keytar.deletePassword(
        CredentialManager.service,
        CredentialManager.passwordIdentifier
      );
    }
    return false;
  }
  public static getTwitchToken(): Promise<string | null> {
    return new Promise<string | null>(async (resolve) => {
      const password = await CredentialManager.getPassword(
        CredentialManager.passwordIdentifier
      );
      resolve(password);
    });
  }
  private static async getPassword(account: string): Promise<string | null> {
    if (CredentialManager.keytar) {
      return await CredentialManager.keytar.getPassword(
        CredentialManager.service,
        account
      );
    }
    return null;
  }
}

export default CredentialManager;
