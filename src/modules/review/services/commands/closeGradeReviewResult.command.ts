import { ICommand } from '@nestjs/cqrs';

export class CloseGradeReviewResultCommand implements ICommand {
  constructor(
    public readonly gradeReviewId: string,
    public readonly courseId: string,
    public readonly point: number,
    public readonly teacherId: string,
    public readonly feedback: string,
  ) {}
}
