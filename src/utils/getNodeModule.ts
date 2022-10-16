import { env } from 'vscode';
import * as keytartype from 'keytar';

declare const WEBPACK_REQUIRE: typeof require;
declare const NON_WEBPACK_REQUIRE: typeof require;

export const getNodeModule = <T>(moduleName: string): T | undefined => {
  const r =
    typeof WEBPACK_REQUIRE === 'function' ? NON_WEBPACK_REQUIRE : require;
  try {
    return r(`${env.appRoot}/node_modules.asar/${moduleName}`);
  } catch (err) {
    // Not in ASAR
  }
  try {
    return r(`${env.appRoot}/node_modules/${moduleName}`);
  } catch (err) {
    // Not available
  }
  return undefined;
};
