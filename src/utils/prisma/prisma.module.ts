import { DynamicModule, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaClient } from '@prisma/client';

@Module({
  providers: [PrismaService, PrismaClient],
  exports: [PrismaService, PrismaClient],
})
export class PrismaModule {
  static forRoot(options: { isGlobal?: boolean }): DynamicModule {
    return {
      module: PrismaModule,
      global: options.isGlobal,
    };
  }
}
