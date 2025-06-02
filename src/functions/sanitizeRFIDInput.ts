export const sanitizeRFID = (input: string) => {
  return input.replace(/[^0-9A-F]/gi, "");
};
