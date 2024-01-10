import { ICommand } from '@nestjs/cqrs';
import { GradeReviewStatus } from '@prisma/client';

export class FinalizedGradeReviewCommand implements ICommand {
  constructor(
    public readonly gradeReviewId: string,
    public readonly finalizedBy: string,
    public readonly status: GradeReviewStatus,
  ) {}
}
