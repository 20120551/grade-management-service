import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReAssignGradeReviewResultCommand } from '../ReAssignGradeReviewResult.command';
import { GradeReview } from '@prisma/client';
import { IGradeReviewRepo } from 'modules/review/repositories';
import { BadRequestException } from 'utils/errors/domain.error';
import { plainToInstance } from 'class-transformer';
import { ReAssignGradeReviewResultEvent } from 'modules/review/entities/events';
import { Inject } from '@nestjs/common';

@CommandHandler(ReAssignGradeReviewResultCommand)
export class ReAssignGradeReviewResultCommandHandler
  implements ICommandHandler<ReAssignGradeReviewResultCommand, GradeReview>
{
  constructor(
    @Inject(IGradeReviewRepo)
    private readonly _gradeReviewRepo: IGradeReviewRepo,
  ) {}

  async execute(
    command: ReAssignGradeReviewResultCommand,
  ): Promise<GradeReview> {
    const gradeReview = await this._gradeReviewRepo.findById(
      command.gradeReviewId,
    );
    if (!gradeReview) {
      throw new BadRequestException(
        `not found grade review id ${command.gradeReviewId}`,
      );
    }

    gradeReview.reAssignGradeReview(
      plainToInstance(ReAssignGradeReviewResultEvent, command),
    );
    await this._gradeReviewRepo.persist(gradeReview);
    return gradeReview;
  }
}
