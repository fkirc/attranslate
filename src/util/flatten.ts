const _ = require('lodash');

export function unflatten(params: any) {
  return _.reduce(
    params,
    function (result: unknown, value: unknown, key: string) {
      return _.set(result, key, value);
    },
    {},
  );
}

export function flatten(obj: unknown) {
  return _.transform(
    obj,
    function (result: unknown, value: unknown, key: string) {
      if (_.isObject(value)) {
        const flatMap = _.mapKeys(flatten(value), function (
          mvalue: object,
          mkey: string,
        ) {
          if (_.isArray(value)) {
            const index = mkey.indexOf('.');
            if (-1 !== index) {
              return `${key}[${mkey.slice(0, index)}]${mkey.slice(index)}`;
            }
            return `${key}[${mkey}]`;
          }
          return `${key}.${mkey}`;
        });

        _.assign(result, flatMap);
      } else {
        (result as any)[key] = value;
      }

      return result;
    },
    {},
  );
}
