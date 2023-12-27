import { Module } from '@nestjs/common';
import { HealthcheckController } from './health.check.controller';

@Module({
  controllers: [HealthcheckController],
})
export class HealthCheckModule {}
