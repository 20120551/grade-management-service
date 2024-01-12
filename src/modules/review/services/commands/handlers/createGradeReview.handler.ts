import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateGradeReviewCommand } from '../createGradeReview.command';
import { PrismaService } from 'utils/prisma';
import { GradeReview, UserCourseRole } from '@prisma/client';
import { IFirebaseFireStoreService } from 'utils/firebase';
import { Inject } from '@nestjs/common';
import { NotificationTemplate } from 'modules/review/resources/events';
import { BadRequestException } from 'utils/errors/domain.error';

@CommandHandler(CreateGradeReviewCommand)
export class CreateGradeReviewCommandHandler
  implements ICommandHandler<CreateGradeReviewCommand, GradeReview>
{
  constructor(
    @Inject(IFirebaseFireStoreService)
    private readonly _fireStore: IFirebaseFireStoreService,
    private readonly _prismaService: PrismaService,
  ) {}

  async execute({
    gradeTypeId,
    courseId,
    ...command
  }: CreateGradeReviewCommand): Promise<GradeReview> {
    const user = await this._prismaService.studentCard.findUnique({
      where: {
        userId: command.userId,
      },
      select: {
        studentId: true,
      },
    });

    if (!user.studentId) {
      throw new BadRequestException('Not found student id');
    }

    const userCourseGrade =
      await this._prismaService.userCourseGrade.findUnique({
        where: {
          gradeTypeId_studentId: {
            gradeTypeId: gradeTypeId,
            studentId: user.studentId,
          },
        },
        select: {
          id: true,
          gradeTypeId: true,
        },
      });

    const gradeReview = await this._prismaService.gradeReview.create({
      data: {
        ...command,
        userCourseGradeId: userCourseGrade.id,
      },
    });

    const teacherIds = await this._prismaService.userCourse.findMany({
      where: {
        courseId: courseId,
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
      redirectEndpoint: `/home/course/${courseId}#points?
      studentid=${user.studentId}&gradeTypeId=${userCourseGrade.gradeTypeId}&
      gradeReviewId=${gradeReview.id}`,
      status: 'processing',
      title: 'New grade for you to review',
      isPublished: false,
      isRead: false,
    };

    await this._fireStore.create('notifications', event);

    return gradeReview;
  }
}
