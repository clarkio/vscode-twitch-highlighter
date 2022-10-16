import { isString, isNumber } from 'util';

export const isEnum = (value: any, enumeration: {}): boolean => {
  if (value === undefined || (!isString(value) && !isNumber(value))) {
    return false;
  }
  return Object.values(enumeration).includes(value);
};
