import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateGradeReviewResultCommand } from '../createGradeReviewResult.command';
import { GradeReview } from '@prisma/client';
import { IGradeReviewRepo } from 'modules/review/repositories';
import { BadRequestException } from 'utils/errors/domain.error';
import { CreateGradeReviewResultEvent } from 'modules/review/entities/events';
import { plainToInstance } from 'class-transformer';
import { Inject } from '@nestjs/common';

@CommandHandler(CreateGradeReviewResultCommand)
export class CreateGradeReviewResultCommandHandler
  implements ICommandHandler<CreateGradeReviewResultCommand, GradeReview>
{
  constructor(
    @Inject(IGradeReviewRepo)
    private readonly _gradeReviewRepo: IGradeReviewRepo,
  ) {}

  async execute(command: CreateGradeReviewResultCommand): Promise<GradeReview> {
    const gradeReview = await this._gradeReviewRepo.findById(
      command.gradeReviewId,
    );
    if (!gradeReview) {
      throw new BadRequestException(
        `not found grade review id ${command.gradeReviewId}`,
      );
    }

    gradeReview.createGradeReview(
      plainToInstance(CreateGradeReviewResultEvent, command),
    );
    await this._gradeReviewRepo.persist(gradeReview);
    return gradeReview;
  }
}
