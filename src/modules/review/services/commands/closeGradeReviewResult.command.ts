import { ICommand } from '@nestjs/cqrs';

export class CloseGradeReviewResultCommand implements ICommand {
  constructor(
    public readonly gradeReviewId: string,
    public readonly point: number,
    public readonly techerId: string,
    public readonly feedback: string,
  ) {}
}