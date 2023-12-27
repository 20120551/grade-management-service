import { ICommand } from '@nestjs/cqrs';

export class DeleteGradeReviewCommand implements ICommand {
  constructor(public readonly gradeReviewId: string) {}
}
