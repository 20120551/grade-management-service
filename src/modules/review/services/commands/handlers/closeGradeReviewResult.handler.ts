import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CloseGradeReviewResultCommand } from '../closeGradeReviewResult.command';
import { GradeReview } from '@prisma/client';
import { IGradeReviewRepo } from 'modules/review/repositories';
import { BadRequestException } from 'utils/errors/domain.error';
import { CloseGradeReviewResultEvent } from 'modules/review/entities/events';
import { plainToInstance } from 'class-transformer';
import { Inject } from '@nestjs/common';
import { IFirebaseFireStoreService } from 'utils/firebase';
import { NotificationTemplate } from 'modules/grade/resources/events';

@CommandHandler(CloseGradeReviewResultCommand)
export class CloseGradeReviewResultCommandHandler
  implements ICommandHandler<CloseGradeReviewResultCommand, GradeReview>
{
  constructor(
    @Inject(IGradeReviewRepo)
    private readonly _gradeReviewRepo: IGradeReviewRepo,
    @Inject(IFirebaseFireStoreService)
    private readonly _fireStore: IFirebaseFireStoreService,
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

    // TODO: add firebase event
    const event: NotificationTemplate = {
      senderId: command.teacherId,
      recipientIds: [gradeReview.userId],
      content: `Teacher close your grade review request`,
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
