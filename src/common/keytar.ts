import * as keytartype from 'keytar';
import { getNodeModule } from '../utils';

export const keytar: typeof keytartype | undefined =
  getNodeModule<typeof keytartype>('keytar');
