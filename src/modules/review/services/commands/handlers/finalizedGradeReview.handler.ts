import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from 'utils/prisma';
import { GradeReview, GradeReviewResult, PrismaClient } from '@prisma/client';
import { FinalizedGradeReviewCommand } from '../finalizedGradeReview.command';
import { BadRequestException } from 'utils/errors/domain.error';
import { NotificationTemplate } from 'modules/review/resources/events';
import { IFirebaseFireStoreService } from 'utils/firebase';
import { Inject } from '@nestjs/common';

@CommandHandler(FinalizedGradeReviewCommand)
export class FinalizedGradeReviewCommandHandler
  implements ICommandHandler<FinalizedGradeReviewCommand, GradeReview>
{
  constructor(
    private readonly _prisma: PrismaClient,
    private readonly _prismaService: PrismaService,
    @Inject(IFirebaseFireStoreService)
    private readonly _fireStore: IFirebaseFireStoreService,
  ) {}

  async execute(command: FinalizedGradeReviewCommand): Promise<GradeReview> {
    const { gradeReviewId, ...payload } = command;
    const lastEvent = await this._findLastEvent(gradeReviewId);
    if (!lastEvent) {
      throw new BadRequestException("You don't have any review");
    }

    const res = await this._prisma.$transaction(async (context) => {
      const res = await context.gradeReview.update({
        where: {
          id: gradeReviewId,
        },
        data: {
          status: payload.status,
          userCourseGrade: {
            update: {
              data: {
                point: lastEvent.point,
              },
            },
          },
        },
      });

      return res;
    });

    const event: NotificationTemplate = {
      senderId: payload.finalizedBy,
      recipientIds: [res.userId],
      content: `Teacher mark your grade review request as done`,
      type: 'notification',
      redirectEndpoint: `/grade/review/${res.id}`,
      status: 'processing',
      title: 'Grade review result',
      isPublished: false,
    };

    await this._fireStore.create('notifications', event);

    return res;
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
    });

    return events[0];
  }
}
