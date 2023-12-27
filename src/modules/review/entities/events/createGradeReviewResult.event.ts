import { IEvent } from '@nestjs/cqrs';
import { GradeReviewResultEvent } from '@prisma/client';

export class CreateGradeReviewResultEvent implements IEvent {
  public event: GradeReviewResultEvent = GradeReviewResultEvent.ASSIGN;
  public version: number = 0;
  constructor(
    public readonly point: number,
    public readonly techerId: string,
    public readonly feedback: string,
  ) {}
}
