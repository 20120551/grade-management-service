import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GradeReview } from '@prisma/client';
import { BadRequestException } from 'utils/errors/domain.error';
import { GetGradeReviewDetailQuery } from '../getGradeReviewDetail.query';
import { PrismaService } from 'utils/prisma';

@QueryHandler(GetGradeReviewDetailQuery)
export class GradeReviewDetailQueryHandler
  implements IQueryHandler<GetGradeReviewDetailQuery, GradeReview>
{
  constructor(private readonly _prismaService: PrismaService) {}

  async execute(query: GetGradeReviewDetailQuery): Promise<GradeReview> {
    const gradeReview = await this._prismaService.gradeReview.findUnique({
      where: {
        id: query.gradeReviewId,
      },
      include: {
        gradeReviewResults: {
          take: query.take,
          skip: query.skip,
        },
      },
    });

    if (!gradeReview) {
      throw new BadRequestException(
        `not found grade review id ${query.gradeReviewId}`,
      );
    }

    return gradeReview;
  }
}
