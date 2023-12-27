import { IQuery } from '@nestjs/cqrs';

export class GetGradeReviewQuery implements IQuery {
  constructor(
    public readonly userCourseGradeId: string,
    public readonly take?: number,
    public readonly skip?: number,
  ) {}
}
