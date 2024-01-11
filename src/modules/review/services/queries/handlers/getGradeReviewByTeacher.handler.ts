import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserCourseGrade } from '@prisma/client';
import { BadRequestException } from 'utils/errors/domain.error';
import { PrismaService } from 'utils/prisma';
import { GetGradeReviewInCourseOfStudentQuery } from '../getGradeReviewInCourse.query';
import { isEmpty } from 'lodash';

@QueryHandler(GetGradeReviewInCourseOfStudentQuery)
export class GradeReviewInCourseOfStudentQueryHandler
  implements
    IQueryHandler<GetGradeReviewInCourseOfStudentQuery, UserCourseGrade[]>
{
  constructor(private readonly _prismaService: PrismaService) {}

  async execute(
    query: GetGradeReviewInCourseOfStudentQuery,
  ): Promise<UserCourseGrade[]> {
    const userCourseGrade = await this._prismaService.userCourseGrade.findMany({
      where: {
        courseId: query.courseId,
        studentId: query.studentId,
      },
      include: {
        gradeType: true,
        gradeReviews: {
          include: {
            gradeReviewResults: true,
          },
        },
      },
    });

    if (!userCourseGrade) {
      throw new BadRequestException(
        `not found grade type id ${query.courseId}`,
      );
    }

    return userCourseGrade
      .map((data) => {
        if (isEmpty(data.gradeReviews)) {
          return;
        }

        return {
          ...data,
          status: this._getGradeReviewStatus(data.gradeReviews),
        };
      })
      .filter(Boolean);
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
