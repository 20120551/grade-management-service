import { AggregateRoot, IEvent } from '@nestjs/cqrs';
import {
  GradeReview,
  GradeReviewResult,
  GradeReviewStatus,
} from '@prisma/client';

export class GradeReviewEntity
  extends AggregateRoot<GradeReviewResult>
  implements GradeReview
{
  id: string;
  topic: string;
  desc: string;
  userId: string;
  expectedGrade: number;
  userCourseGradeId: string;
  status: GradeReviewStatus;

  constructor(
    id: string,
    topic: string,
    desc: string,
    userId: string,
    expectedGrade: number,
    userCourseGradeId: string,
    status: GradeReviewStatus,
  ) {
    super();
    this.id = id;
    this.topic = topic;
    this.desc = desc;
    this.userId = userId;
    this.expectedGrade = expectedGrade;
    this.userCourseGradeId = userCourseGradeId;
    this.status = status;
  }

  createGradeReview(event: IEvent) {
    this.apply(event as GradeReviewResult);
  }
  reAssignGradeReview(event: IEvent) {
    this.apply(event as GradeReviewResult);
  }
  closeGradeReview(event: IEvent) {
    this.apply(event as GradeReviewResult);
  }
}
