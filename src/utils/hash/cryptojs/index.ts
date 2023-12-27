import { ModuleMetadata, Provider, Type } from '@nestjs/common';

export const CryptoJSModuleOptions = 'CryptoJSModuleOptions';
export interface CryptoJSModuleOptions {
  secretKey: string;
}

export interface CryptoJSOptionsFactory {
  createSendgirdOptions():
    | Promise<CryptoJSModuleOptions>
    | CryptoJSModuleOptions;
}

export interface CryptoJSModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  global?: boolean;
  useFactory?: (
    ...args: any[]
  ) => Promise<CryptoJSModuleOptions> | CryptoJSModuleOptions;
  inject?: any[];
  useExisting?: Type<CryptoJSOptionsFactory>;
  useClass?: Type<CryptoJSOptionsFactory>;
  providers?: Provider[];
}

export * from './cryptojs.module';
export * from './cryptojs.service';
