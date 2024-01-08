import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateGradeReviewCommand } from '../createGradeReview.command';
import { PrismaService } from 'utils/prisma';
import { GradeReview, UserCourseRole } from '@prisma/client';
import { IFirebaseFireStoreService } from 'utils/firebase';
import { Inject } from '@nestjs/common';
import { NotificationTemplate } from 'modules/review/resources/events';

@CommandHandler(CreateGradeReviewCommand)
export class CreateGradeReviewCommandHandler
  implements ICommandHandler<CreateGradeReviewCommand, GradeReview>
{
  constructor(
    @Inject(IFirebaseFireStoreService)
    private readonly _fireStore: IFirebaseFireStoreService,
    private readonly _prismaService: PrismaService,
  ) {}

  async execute(command: CreateGradeReviewCommand): Promise<GradeReview> {
    const gradeReview = await this._prismaService.gradeReview.create({
      data: command,
    });

    const teacherIds = await this._prismaService.userCourse.findMany({
      where: {
        courseId: command.courseId,
        role: {
          in: [UserCourseRole.HOST, UserCourseRole.TEACHER],
        },
      },
      select: {
        userId: true,
      },
    });

    // TODO: add firebase event
    const event: NotificationTemplate = {
      senderId: command.userId,
      recipientIds: teacherIds.map((teacher) => teacher.userId),
      content: `Student make a grade review for you`,
      type: 'notification',
      redirectEndpoint: `/grade/review/${gradeReview.id}`,
      status: 'processing',
      title: 'New grade for you to review',
      isPublished: false,
    };

    await this._fireStore.create('notifications', event);

    return gradeReview;
  }
}
