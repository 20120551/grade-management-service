import { DynamicModule, Module, Provider } from '@nestjs/common';
import { FirebaseModuleOptions, FirebaseModuleAsyncOptions } from '.';
import {
  FirebaseStorageService,
  IFirebaseStorageService,
} from './firebase.storage.service';
import {
  FirebaseFireStoreService,
  IFirebaseFireStoreService,
} from './firebase.firestore.service';

@Module({
  providers: [
    {
      provide: IFirebaseStorageService,
      useClass: FirebaseStorageService,
    },
    {
      provide: IFirebaseFireStoreService,
      useClass: FirebaseFireStoreService,
    },
  ],
  exports: [IFirebaseStorageService, IFirebaseFireStoreService],
})
export class FirebaseModule {
  static forRoot(options: FirebaseModuleOptions): DynamicModule {
    return {
      module: FirebaseModule,
      providers: [
        {
          provide: FirebaseModuleOptions,
          useExisting: options,
        },
      ],
    };
  }

  static forRootAsync(options: FirebaseModuleAsyncOptions): DynamicModule {
    return {
      global: options.global || false,
      module: FirebaseModule,
      providers: [
        ...this.createAsyncProvider(options),
        ...(options.providers || []),
      ],
      imports: options.imports,
    };
  }

  private static createAsyncProvider(
    options: FirebaseModuleAsyncOptions,
  ): Provider[] {
    const result = [];
    if (options.useFactory) {
      result.push({
        provide: FirebaseModuleOptions,
        useFactory: options.useFactory,
        inject: options.inject || [],
      });
    }

    if (options.useClass) {
      result.push({
        provide: FirebaseModuleOptions,
        useClass: options.useClass,
      });
    }

    if (options.useExisting) {
      result.push({
        provide: FirebaseModuleOptions,
        useExisting: options.useExisting,
      });
    }

    return result;
  }
}
