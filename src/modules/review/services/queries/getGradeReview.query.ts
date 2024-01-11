import { IQuery } from '@nestjs/cqrs';

export class GetGradeReviewQuery implements IQuery {
  constructor(
    public readonly gradeTypeId: string,
    public readonly userId: string,
    public readonly take?: number,
    public readonly skip?: number,
  ) {}
}
