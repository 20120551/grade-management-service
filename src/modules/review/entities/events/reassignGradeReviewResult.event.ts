import { IEvent } from '@nestjs/cqrs';
import { GradeReviewResultEvent } from '@prisma/client';

export class ReAssignGradeReviewResultEvent implements IEvent {
  public event: GradeReviewResultEvent = GradeReviewResultEvent.REASSIGN;
  constructor(
    public readonly point: number,
    public readonly techerId: string,
    public readonly feedback: string,
    public readonly version: number,
  ) {}
}
