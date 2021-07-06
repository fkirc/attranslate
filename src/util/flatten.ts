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

function escapeKey(str: string): string {
  if (typeof str !== "string") {
    return str;
  }
  let targetStr: string = str;
  for (const search of Object.keys(escapeRules)) {
    const replace = escapeRules[search];
    targetStr = replaceAll(targetStr, search, replace);
  }
  return targetStr;
}

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

export function flatten(obj: unknown): Record<string, string> {
  return _.transform(
    obj as never,
    function (result: Record<string, unknown>, value: unknown, rawKey: string) {
      const key = escapeKey(rawKey);
      if (_.isObject(value)) {
        const flatMap = _.mapKeys(
          flatten(value),
          function (mvalue: unknown, mkey: string) {
            if (_.isArray(value)) {
              const index = mkey.indexOf(NESTED_JSON_SEPARATOR);
              if (-1 !== index) {
                return `${key}[${mkey.slice(0, index)}]${mkey.slice(index)}`;
              }
              return `${key}[${mkey}]`;
            }
            return `${key}.${mkey}`;
          }
        );

        _.assign(result, flatMap);
      } else {
        result[key] = value;
      }

      return result;
    },
    {}
  );
}
