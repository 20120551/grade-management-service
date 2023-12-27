import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserCourseGrade } from '@prisma/client';
import { BadRequestException } from 'utils/errors/domain.error';
import { GetGradeReviewQuery } from '../getGradeReview.query';
import { PrismaService } from 'utils/prisma';

@QueryHandler(GetGradeReviewQuery)
export class GradeReviewQueryHandler
  implements IQueryHandler<GetGradeReviewQuery, UserCourseGrade>
{
  constructor(private readonly _prismaService: PrismaService) {}

  async execute(query: GetGradeReviewQuery): Promise<UserCourseGrade> {
    const userCourseGrade =
      await this._prismaService.userCourseGrade.findUnique({
        where: {
          id: query.userCourseGradeId,
        },
        include: {
          gradeReviews: {
            take: query.take,
            skip: query.skip,
          },
        },
      });

    if (!userCourseGrade) {
      throw new BadRequestException(
        `not found grade type id ${query.userCourseGradeId}`,
      );
    }

    return userCourseGrade;
  }
}
