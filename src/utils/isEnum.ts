import { isString, isNumber } from "util";

export const isEnum = (value: any, Enum: {}): boolean => {
  if (value === undefined || !isString(value) && !isNumber(value)) {
    return false;
  }
  return Object.values(Enum).includes(value);
};
