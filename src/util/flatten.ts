import _ from "lodash";

export const NESTED_JSON_SEPARATOR = ".";

function replaceAll(string: string, search: string, replace: string): string {
  return string.split(search).join(replace);
}

const escapeRules: Record<string, string> = {
  ".": "\\\\|",
  "[": "\\\\(",
  "]": "\\\\)",
};

function unescapeKey(str: string): string {
  let targetStr: string = str;
  for (const replace of Object.keys(escapeRules)) {
    const search = escapeRules[replace];
    targetStr = replaceAll(targetStr, search, replace);
  }
  return targetStr;
}

function unescapeObject(obj: Record<string, unknown>) {
  const targetObj: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    let value = obj[key];
    if (typeof value === "object" && value !== null) {
      value = unescapeObject(value as Record<string, unknown>);
    }
    targetObj[unescapeKey(key)] = value;
  }
  return targetObj;
}

export function unflatten(params: Record<string, unknown>) {
  const rawUnflattened = _.reduce(
    params,
    function (result: Record<string, unknown>, value: unknown, key: string) {
      return _.set(result, key, value);
    },
    {}
  );
  return unescapeObject(rawUnflattened);
}
