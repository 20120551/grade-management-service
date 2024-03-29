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
import { PrismaService } from 'utils/prisma';

@CommandHandler(ReAssignGradeReviewResultCommand)
export class ReAssignGradeReviewResultCommandHandler
  implements ICommandHandler<ReAssignGradeReviewResultCommand, GradeReview>
{
  constructor(
    @Inject(IGradeReviewRepo)
    private readonly _gradeReviewRepo: IGradeReviewRepo,
    @Inject(IFirebaseFireStoreService)
    private readonly _fireStore: IFirebaseFireStoreService,
    private readonly _prismaService: PrismaService,
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

    const userCourseGrade =
      await this._prismaService.userCourseGrade.findUnique({
        where: {
          id: gradeReview.userCourseGradeId,
        },
        select: {
          courseId: true,
          studentId: true,
          gradeTypeId: true,
        },
      });

    const res = await this._gradeReviewRepo.persist(gradeReview);
    // TODO: add firebase event
    const event: NotificationTemplate = {
      senderId: command.teacherId,
      recipientIds: [gradeReview.userId],
      content: `Teacher has re-assign your grade review`,
      type: 'notification',
      redirectEndpoint: `/home/course/${userCourseGrade.courseId}#points?studentid=${userCourseGrade.studentId}&gradeTypeId=${userCourseGrade.gradeTypeId}&gradeReviewId=${gradeReview.id}`,
      status: 'processing',
      title: 'Grade review result',
      isPublished: false,
      isRead: false,
    };

    await this._fireStore.create('notifications', event);
    return gradeReview;
  }
}
