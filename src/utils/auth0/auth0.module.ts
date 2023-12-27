import { DynamicModule, Module, Provider } from '@nestjs/common';
import {
  Auth0ModuleAsyncOptions,
  Auth0ModuleOptions,
  Auth0Service,
  IAuth0Service,
} from '.';

@Module({
  providers: [
    {
      provide: IAuth0Service,
      useClass: Auth0Service,
    },
  ],
  exports: [IAuth0Service],
})
export class Auth0Module {
  static forRoot(options: Auth0ModuleOptions): DynamicModule {
    return {
      module: Auth0Module,
      providers: [
        {
          provide: Auth0ModuleOptions,
          useExisting: options,
        },
      ],
      exports: [Auth0ModuleOptions],
    };
  }

  static forRootAsync(options: Auth0ModuleAsyncOptions): DynamicModule {
    return {
      global: options.global || false,
      module: Auth0Module,
      providers: [
        ...this.createAsyncProvider(options),
        ...(options.providers || []),
      ],
      imports: options.imports,
      exports: [Auth0ModuleOptions],
    };
  }

  private static createAsyncProvider(
    options: Auth0ModuleAsyncOptions,
  ): Provider[] {
    const result = [];
    if (options.useFactory) {
      result.push({
        provide: Auth0ModuleOptions,
        useFactory: options.useFactory,
        inject: options.inject || [],
      });
    }

    if (options.useClass) {
      result.push({
        provide: Auth0ModuleOptions,
        useClass: options.useClass,
      });
    }

    if (options.useExisting) {
      result.push({
        provide: Auth0ModuleOptions,
        useExisting: options.useExisting,
      });
    }

    return result;
  }
}
