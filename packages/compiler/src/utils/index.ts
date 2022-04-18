export const escapeRegexStr = (str: string) => str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");

export const generateSplitRegex = (delimiters: string[]) =>
  new RegExp(`(${delimiters.map((x) => escapeRegexStr(x)).join("|")})`, "g");

export const splitByChars = (str: string, delimiters: string[]) => {
  const splitted = str.split(generateSplitRegex(delimiters));

  if (splitted[splitted.length - 1] === "") {
    return splitted.slice(0, -1);
  }

  return splitted;
};

export const findIndexAt = (idx: number, arr: any[], func: (item: any) => boolean) => {
  for (let i = idx; i < arr.length; i++) {
    if (func(arr[i])) {
      return i;
    }
  }

  return -1;
};

export const isValidVariableName = (name: string) => /^[a-zA-Z_]\w*$/.test(name);
