import { DynamicModule, Module, Provider } from '@nestjs/common';
import { CryptoJSModuleAsyncOptions, CryptoJSModuleOptions } from '.';
import { ICryptoJSService, CryptoJSService } from './cryptojs.service';

@Module({
  providers: [
    {
      provide: ICryptoJSService,
      useClass: CryptoJSService,
    },
  ],
  exports: [ICryptoJSService],
})
export class CryptoJSModule {
  static forRoot(options: CryptoJSModuleOptions): DynamicModule {
    return {
      module: CryptoJSModule,
      providers: [
        {
          provide: CryptoJSModuleOptions,
          useExisting: options,
        },
      ],
    };
  }

  static forRootAsync(options: CryptoJSModuleAsyncOptions): DynamicModule {
    return {
      global: options.global || false,
      module: CryptoJSModule,
      providers: [
        ...this.createAsyncProvider(options),
        ...(options.providers || []),
      ],
      imports: options.imports,
    };
  }

  private static createAsyncProvider(
    options: CryptoJSModuleAsyncOptions,
  ): Provider[] {
    const result = [];
    if (options.useFactory) {
      result.push({
        provide: CryptoJSModuleOptions,
        useFactory: options.useFactory,
        inject: options.inject || [],
      });
    }

    if (options.useClass) {
      result.push({
        provide: CryptoJSModuleOptions,
        useClass: options.useClass,
      });
    }

    if (options.useExisting) {
      result.push({
        provide: CryptoJSModuleOptions,
        useExisting: options.useExisting,
      });
    }

    return result;
  }
}
