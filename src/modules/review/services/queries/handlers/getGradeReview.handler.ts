import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserCourseGrade } from '@prisma/client';
import { BadRequestException } from 'utils/errors/domain.error';
import { GetGradeReviewQuery } from '../getGradeReview.query';
import { PrismaService } from 'utils/prisma';
import { isEmpty } from 'lodash';

@QueryHandler(GetGradeReviewQuery)
export class GradeReviewQueryHandler
  implements IQueryHandler<GetGradeReviewQuery, UserCourseGrade>
{
  constructor(private readonly _prismaService: PrismaService) {}

  async execute(query: GetGradeReviewQuery): Promise<UserCourseGrade> {
    const user = await this._prismaService.studentCard.findUnique({
      where: {
        userId: query.userId,
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
            gradeTypeId: query.gradeTypeId,
            studentId: user.studentId,
          },
        },
        include: {
          gradeType: true,
          gradeReviews: {
            take: query.take,
            skip: query.skip,
            include: {
              gradeReviewResults: {
                include: {
                  teacher: true,
                },
              },
            },
          },
        },
      });

    if (!userCourseGrade) {
      throw new BadRequestException(
        `not found grade type id ${query.gradeTypeId}`,
      );
    }

    return {
      ...userCourseGrade,
      status: this._getGradeReviewStatus(userCourseGrade.gradeReviews),
    } as any;
  }

  private _getGradeReviewStatus(gradeReviews: { status: string }[]): string {
    if (isEmpty(gradeReviews)) {
      return 'NOREVIEWS';
    }

    if (gradeReviews.every(({ status }) => status === 'DONE')) {
      return 'DONE';
    }

    return 'REQUEST';
  }
}
