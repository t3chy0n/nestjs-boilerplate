import { omitBy, isNil } from 'lodash';

/***
 * Transforms params to array, and converts to given type. For now, it supports conversion to Number only.
 *
 * @param params
 * @constructor
 */
export function TransformToArray(params?: { sep?: string; type?: any }) {
  return ({ value }) => {
    const { sep, type } = params || {};
    const separator = !sep ? ',' : sep;

    if (!Array.isArray(value)) {
      value = value.split(separator);
    }

    if (type === Number) {
      return value.map((v) => parseInt(v, 10));
    }

    return value;
  };
}

export function omitEmpty(obj: Record<string, any>): Record<string, any> {
  return omitBy(obj, isNil);
}
