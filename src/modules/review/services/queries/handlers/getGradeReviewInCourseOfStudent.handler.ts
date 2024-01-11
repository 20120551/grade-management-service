import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserCourseGrade } from '@prisma/client';
import { BadRequestException } from 'utils/errors/domain.error';
import { PrismaService } from 'utils/prisma';
import { GetGradeReviewByTeacherQuery } from '../getGradeReviewByTeacher.query';

@QueryHandler(GetGradeReviewByTeacherQuery)
export class GradeReviewByTeacherQueryHandler
  implements IQueryHandler<GetGradeReviewByTeacherQuery, UserCourseGrade>
{
  constructor(private readonly _prismaService: PrismaService) {}

  async execute(query: GetGradeReviewByTeacherQuery): Promise<UserCourseGrade> {
    const userCourseGrade =
      await this._prismaService.userCourseGrade.findUnique({
        where: {
          gradeTypeId_studentId: {
            gradeTypeId: query.gradeTypeId,
            studentId: query.studentId,
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

    return userCourseGrade;
  }
}
