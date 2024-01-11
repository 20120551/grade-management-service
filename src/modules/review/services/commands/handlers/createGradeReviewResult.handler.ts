import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateGradeReviewResultCommand } from '../createGradeReviewResult.command';
import { GradeReview } from '@prisma/client';
import { IGradeReviewRepo } from 'modules/review/repositories';
import { BadRequestException } from 'utils/errors/domain.error';
import { CreateGradeReviewResultEvent } from 'modules/review/entities/events';
import { plainToInstance } from 'class-transformer';
import { Inject } from '@nestjs/common';
import { NotificationTemplate } from 'modules/grade/resources/events';
import { IFirebaseFireStoreService } from 'utils/firebase';

@CommandHandler(CreateGradeReviewResultCommand)
export class CreateGradeReviewResultCommandHandler
  implements ICommandHandler<CreateGradeReviewResultCommand, GradeReview>
{
  constructor(
    @Inject(IGradeReviewRepo)
    private readonly _gradeReviewRepo: IGradeReviewRepo,
    @Inject(IFirebaseFireStoreService)
    private readonly _fireStore: IFirebaseFireStoreService,
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
    const res = await this._gradeReviewRepo.persist(gradeReview);

    // TODO: add firebase event
    const event: NotificationTemplate = {
      senderId: command.teacherId,
      recipientIds: [gradeReview.userId],
      content: `Teacher make a grade review for your request`,
      type: 'notification',
      redirectEndpoint: `/grade/review/${gradeReview.id}`,
      status: 'processing',
      title: 'Grade review result',
      isPublished: false,
    };

    await this._fireStore.create('notifications', event);

    return res;
  }
}
