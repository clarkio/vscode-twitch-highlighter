import { env } from 'vscode';
import * as keytartype from 'keytar';


declare const __webpack_require__: typeof require;
declare const __non_webpack_require__: typeof require;

export const getNodeModule = <T>(moduleName: string): T | undefined => {
  const r = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require;
  try {
    return r(`${env.appRoot}/node_modules.asar/${moduleName}`);
  }
  catch ( err ) {
    // Not in ASAR
  }
  try {
    return r(`${env.appRoot}/node_modules/${moduleName}`);
  }
  catch ( err ) {
    // Not available
  }
  return undefined;
};
