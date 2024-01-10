import { ICommand } from '@nestjs/cqrs';
import { GradeReviewStatus } from '@prisma/client';

export class FinalizedGradeReviewCommand implements ICommand {
  public readonly status: GradeReviewStatus = GradeReviewStatus.DONE;
  constructor(
    public readonly gradeReviewId: string,
    public readonly finalizedBy: string,
  ) {}
}
