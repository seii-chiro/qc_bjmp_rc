/* eslint-disable @typescript-eslint/no-explicit-any */
export const addIfExists = (obj: any, key: string, value: any) => {
  if (value !== null && value !== undefined && value !== "") {
    obj[key] = value;
  }
};