import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import {
  auth0,
  cryptojs,
  firebase,
  redis,
  sendgrid,
} from 'configurations/env.config';
import { GradeModule } from 'modules/grade/grade.module';
import { HealthCheckModule } from 'modules/healthCheck/health.check.module';
import { ReviewModule } from 'modules/review/review.module';
import { RedisClientOptions } from 'redis';
import { Auth0Module, Auth0ModuleOptions } from 'utils/auth0';
import { FirebaseModule, FirebaseModuleOptions } from 'utils/firebase';
import { PrismaModule } from 'utils/prisma';

@Module({
  imports: [
    HealthCheckModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [auth0, sendgrid, cryptojs, firebase, redis],
    }),
    Auth0Module.forRootAsync({
      global: true,
      useFactory: (configService: ConfigService) => {
        const auth0Options = configService.get<Auth0ModuleOptions>('auth0');
        return auth0Options;
      },
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => {
        const redisOptions = configService.get<RedisClientOptions>('redis');
        const store = await redisStore(redisOptions);
        return { store: store as unknown as CacheStore };
      },
      inject: [ConfigService],
    }),
    FirebaseModule.forRootAsync({
      global: true,
      useFactory: (configService: ConfigService) => {
        const firebase = configService.get<FirebaseModuleOptions>('firebase');
        return firebase;
      },
      inject: [ConfigService],
    }),
    PrismaModule.forRoot({ isGlobal: true }),
    GradeModule,
    ReviewModule,
  ],
})
export class AppModule {}
