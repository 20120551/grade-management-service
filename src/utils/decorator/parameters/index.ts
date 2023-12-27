import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { ValidationArguments, registerDecorator } from 'class-validator';
import { Request } from 'express';
import { env } from 'process';

type DefaultValueOptions = {
  fromEnv?: boolean;
  filter?: (obj: any) => boolean;
};

export function defaultValue<T>(value: T, options?: DefaultValueOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'defaultValue',
      target: object.constructor,
      propertyName: propertyName,
      validator: {
        validate(_value: any, args: ValidationArguments) {
          let cacheValue = value;
          if (_value) {
            return true;
          }

          if (options?.filter) {
            const isValueAccepted = options.filter(args.object);
            if (isValueAccepted) {
              // pass
            } else {
              return true;
            }
          }

          if (value === undefined) {
            return false;
          }

          if (typeof value === 'function') {
            cacheValue = value();
          }

          let assignValue = cacheValue;
          if (options?.fromEnv) {
            assignValue = env[assignValue as string] as T;
          }

          args.object[args.property] = assignValue;
          return true;
        },
      },
    });
  };
}

export const parseInt = () => {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'parseInt',
      target: object.constructor,
      propertyName: propertyName,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (value !== undefined && value !== null) {
            if (typeof value !== 'number' && typeof value === 'string') {
              args.object[args.property] = +value;
              return true;
            } else if (typeof value === 'number') {
              return true;
            }
            return false;
          }
          return true;
        },
      },
    });
  };
};

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest() as Request;
    return request.user;
  },
);
