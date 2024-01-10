import { ICommand } from '@nestjs/cqrs';
import { GradeReviewStatus } from '@prisma/client';

export class UpdateGradeReviewCommand implements ICommand {
  constructor(
    public readonly gradeReviewId: string,
    public readonly expectedGrade: number,
    public readonly topic: string,
    public readonly desc: string,
  ) {}
}
