import { ICommand } from '@nestjs/cqrs';
import { GradeReviewStatus } from '@prisma/client';

export class CreateGradeReviewCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly userCourseGradeId: string,
    public readonly expectedGrade: number,
    public readonly status: GradeReviewStatus,
    public readonly topic: string,
    public readonly desc: string,
  ) {}
}
