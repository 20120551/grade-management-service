import { IQuery } from '@nestjs/cqrs';

export class GetGradeReviewDetailQuery implements IQuery {
  constructor(
    public readonly gradeReviewId: string,
    public readonly take?: number,
    public readonly skip?: number,
  ) {}
}
