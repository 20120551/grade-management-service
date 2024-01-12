import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateGradeReviewResultCommand } from '../createGradeReviewResult.command';
import { GradeReview, GradeReviewResult } from '@prisma/client';
import { IGradeReviewRepo } from 'modules/review/repositories';
import { BadRequestException } from 'utils/errors/domain.error';
import { CreateGradeReviewResultEvent } from 'modules/review/entities/events';
import { plainToInstance } from 'class-transformer';
import { Inject } from '@nestjs/common';
import { NotificationTemplate } from 'modules/grade/resources/events';
import { IFirebaseFireStoreService } from 'utils/firebase';
import { PrismaService } from 'utils/prisma';

@CommandHandler(CreateGradeReviewResultCommand)
export class CreateGradeReviewResultCommandHandler
  implements ICommandHandler<CreateGradeReviewResultCommand, GradeReviewResult>
{
  constructor(
    @Inject(IGradeReviewRepo)
    private readonly _gradeReviewRepo: IGradeReviewRepo,
    @Inject(IFirebaseFireStoreService)
    private readonly _fireStore: IFirebaseFireStoreService,
    private readonly _prismaService: PrismaService,
  ) {}

  async execute(
    command: CreateGradeReviewResultCommand,
  ): Promise<GradeReviewResult> {
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
    // TODO: add firebase event
    const event: NotificationTemplate = {
      senderId: command.teacherId,
      recipientIds: [gradeReview.userId],
      content: `Teacher make a grade review for your request`,
      type: 'notification',
      redirectEndpoint: `/home/course/${userCourseGrade.courseId}#points?studentid=${userCourseGrade.studentId}&gradeTypeId=${userCourseGrade.gradeTypeId}&gradeReviewId=${gradeReview.id}`,
      status: 'processing',
      title: 'Grade review result',
      isPublished: false,
      isRead: false,
    };

    await this._fireStore.create('notifications', event);

    return this._findLastEvent(gradeReview.id);
  }

  private async _findLastEvent(
    aggregateId: string,
  ): Promise<GradeReviewResult> {
    const events = await this._prismaService.gradeReviewResult.findMany({
      where: {
        gradeReviewId: aggregateId,
      },
      orderBy: [
        {
          version: 'desc',
        },
      ],
      include: {
        teacher: true,
      },
    });

    return events[0];
  }
}
