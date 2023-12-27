import { DynamicModule, Module, Provider } from '@nestjs/common';
import { SendgridModuleAsyncOptions, SendgridModuleOptions } from '.';
import { ISendgridService, SendgridService } from './sendgrid.service';

@Module({
  providers: [
    {
      provide: ISendgridService,
      useClass: SendgridService,
    },
  ],
  exports: [ISendgridService],
})
export class SendgridModule {
  static forRoot(options: SendgridModuleOptions): DynamicModule {
    return {
      module: SendgridModule,
      providers: [
        {
          provide: SendgridModuleOptions,
          useExisting: options,
        },
      ],
    };
  }

  static forRootAsync(options: SendgridModuleAsyncOptions): DynamicModule {
    return {
      global: options.global || false,
      module: SendgridModule,
      providers: [
        ...this.createAsyncProvider(options),
        ...(options.providers || []),
      ],
      imports: options.imports,
    };
  }

  private static createAsyncProvider(
    options: SendgridModuleAsyncOptions,
  ): Provider[] {
    const result = [];
    if (options.useFactory) {
      result.push({
        provide: SendgridModuleOptions,
        useFactory: options.useFactory,
        inject: options.inject || [],
      });
    }

    if (options.useClass) {
      result.push({
        provide: SendgridModuleOptions,
        useClass: options.useClass,
      });
    }

    if (options.useExisting) {
      result.push({
        provide: SendgridModuleOptions,
        useExisting: options.useExisting,
      });
    }

    return result;
  }
}
