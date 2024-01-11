import { IQuery } from '@nestjs/cqrs';

export class GetGradeReviewInCourseOfStudentQuery implements IQuery {
  constructor(
    public readonly studentId: string,
    public readonly courseId: string,
  ) {}
}
