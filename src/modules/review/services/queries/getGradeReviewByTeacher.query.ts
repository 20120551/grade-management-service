import { IQuery } from '@nestjs/cqrs';

export class GetGradeReviewByTeacherQuery implements IQuery {
  constructor(
    public readonly gradeTypeId: string,
    public readonly studentId: string,
    public readonly take?: number,
    public readonly skip?: number,
  ) {}
}
