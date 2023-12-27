import { ModuleMetadata, Provider, Type } from '@nestjs/common';

export const SendgridModuleOptions = 'SendgridModuleOptions';
export interface SendgridModuleOptions {
  apiKey: string;
}

export interface SendgridOptionsFactory {
  createSendgirdOptions():
    | Promise<SendgridModuleOptions>
    | SendgridModuleOptions;
}

export interface SendgridModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  global?: boolean;
  useFactory?: (
    ...args: any[]
  ) => Promise<SendgridModuleOptions> | SendgridModuleOptions;
  inject?: any[];
  useExisting?: Type<SendgridOptionsFactory>;
  useClass?: Type<SendgridOptionsFactory>;
  providers?: Provider[];
}

export * from './sendgrid.module';
export * from './sendgrid.service';
