import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReAssignGradeReviewResultCommand } from '../reAssignGradeReviewResult.command';
import { GradeReview } from '@prisma/client';
import { IGradeReviewRepo } from 'modules/review/repositories';
import { BadRequestException } from 'utils/errors/domain.error';
import { plainToInstance } from 'class-transformer';
import { ReAssignGradeReviewResultEvent } from 'modules/review/entities/events';
import { Inject } from '@nestjs/common';
import { IFirebaseFireStoreService } from 'utils/firebase';
import { NotificationTemplate } from 'modules/grade/resources/events';

@CommandHandler(ReAssignGradeReviewResultCommand)
export class ReAssignGradeReviewResultCommandHandler
  implements ICommandHandler<ReAssignGradeReviewResultCommand, GradeReview>
{
  constructor(
    @Inject(IGradeReviewRepo)
    private readonly _gradeReviewRepo: IGradeReviewRepo,
    @Inject(IFirebaseFireStoreService)
    private readonly _fireStore: IFirebaseFireStoreService,
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
    // TODO: add firebase event
    const event: NotificationTemplate = {
      senderId: command.teacherId,
      recipientIds: [gradeReview.userId],
      content: `Teacher has re-assign your grade review`,
      type: 'notification',
      redirectEndpoint: `/grade/review/${gradeReview.id}`,
      status: 'processing',
      title: 'Grade review result',
      isPublished: false,
    };

    await this._fireStore.create('notifications', event);
    return gradeReview;
  }
}
