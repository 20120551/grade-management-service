import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CloseGradeReviewResultCommand } from '../closeGradeReviewResult.command';
import { GradeReview } from '@prisma/client';
import { IGradeReviewRepo } from 'modules/review/repositories';
import { BadRequestException } from 'utils/errors/domain.error';
import { CloseGradeReviewResultEvent } from 'modules/review/entities/events';
import { plainToInstance } from 'class-transformer';
import { Inject } from '@nestjs/common';

@CommandHandler(CloseGradeReviewResultCommand)
export class CloseGradeReviewResultCommandHandler
  implements ICommandHandler<CloseGradeReviewResultCommand, GradeReview>
{
  constructor(
    @Inject(IGradeReviewRepo)
    private readonly _gradeReviewRepo: IGradeReviewRepo,
  ) {}

  async execute(command: CloseGradeReviewResultCommand): Promise<GradeReview> {
    const gradeReview = await this._gradeReviewRepo.findById(
      command.gradeReviewId,
    );
    if (!gradeReview) {
      throw new BadRequestException(
        `not found grade review id ${command.gradeReviewId}`,
      );
    }

    gradeReview.closeGradeReview(
      plainToInstance(CloseGradeReviewResultEvent, command),
    );
    await this._gradeReviewRepo.persist(gradeReview);
    return gradeReview;
  }
}
