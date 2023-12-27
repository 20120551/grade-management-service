import { Module } from '@nestjs/common';
import { CommandHandlers, QueryHandlers } from './services';
import { GradeReviewRepo, IGradeReviewRepo } from './repositories';
import { ReviewController } from './controllers';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [CqrsModule],
  controllers: [ReviewController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: IGradeReviewRepo,
      useClass: GradeReviewRepo,
    },
  ],
})
export class ReviewModule {}
