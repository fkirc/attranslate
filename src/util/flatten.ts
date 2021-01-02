import _ from "lodash";

export const NESTED_JSON_SEPARATOR = ".";

export function unflatten(params: Record<string, unknown>) {
  return _.reduce(
    params,
    function (result: Record<string, unknown>, value: unknown, key: string) {
      return _.set(result, key, value);
    },
    {}
  );
}

export function flatten(obj: unknown): Record<string, string> {
  return _.transform(
    obj as never,
    function (result: Record<string, unknown>, value: unknown, key: string) {
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
