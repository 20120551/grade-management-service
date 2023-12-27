import { IEvent } from '@nestjs/cqrs';
import { GradeReviewResultEvent } from '@prisma/client';

export class CloseGradeReviewResultEvent implements IEvent {
  public event: GradeReviewResultEvent = GradeReviewResultEvent.DONE;
  constructor(
    public readonly point: number,
    public readonly techerId: string,
    public readonly feedback: string,
    public readonly version: number,
  ) {}
}
