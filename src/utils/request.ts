import { plainToInstance } from 'class-transformer';

export const createQueryUrl = <T extends object>(baseUrl: string, query: T) => {
  if (query === undefined || Object.entries(query).length === 0) {
    return baseUrl;
  }
  let result = baseUrl;
  if (!baseUrl.includes('?')) {
    result = `${result}?`;
  }
  for (const [key, value] of Object.entries(query)) {
    const _query = `${key}=${value}&`;
    result += _query;
  }
  return result.substring(0, result.length - 1);
};

const _createCamelCaseFromObject = <T extends object>(obj: T) => {
  if (obj && typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map(_createCamelCaseFromObject);
    } else {
      return Object.keys(obj).reduce((camelObj, key) => {
        const camelKey = key.replace(/(_\w)/g, (match) =>
          match[1].toUpperCase(),
        );
        camelObj[camelKey] = _createCamelCaseFromObject(obj[key]);
        return camelObj;
      }, {});
    }
  }
  return obj;
};
export const createCamelCaseFromObject = <T extends object, R extends object>(
  obj: T,
  res?: { new (...args: any[]): R },
) => {
  const camelCaseObject = _createCamelCaseFromObject(obj);
  if (res) {
    return plainToInstance(res, camelCaseObject as R);
  }

  return camelCaseObject as R;
};

const _createSnakeCaseFromObject = <T extends object>(obj: T) => {
  if (obj && typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map(_createSnakeCaseFromObject);
    } else {
      return Object.keys(obj).reduce((snakeObj, key) => {
        const snakeKey = key.replace(
          /[A-Z]/g,
          (match) => `_${match.toLowerCase()}`,
        );
        snakeObj[snakeKey] = _createSnakeCaseFromObject(obj[key]);
        return snakeObj;
      }, {});
    }
  }
  return obj;
};
export const createSnakeCaseFromObject = <T extends object, R extends object>(
  obj: T,
  res?: { new (...args: any[]): R },
) => {
  const snakeCase = _createSnakeCaseFromObject(obj);
  if (res) {
    return plainToInstance(res, snakeCase as R);
  }

  return snakeCase as R;
};
