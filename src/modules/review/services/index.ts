import {
  FinalizedGradeReviewCommandHandler,
  CreateGradeReviewCommandHandler,
  CreateGradeReviewResultCommandHandler,
  DeleteGradeReviewCommandHandler,
  ReAssignGradeReviewResultCommandHandler,
  UpdateGradeReviewCommandHandler,
} from './commands/handlers';
import {
  GradeReviewDetailQueryHandler,
  GradeReviewQueryHandler,
  GradeReviewByTeacherQueryHandler,
  GradeReviewInCourseOfStudentQueryHandler,
} from './queries/handlers';

export const QueryHandlers = [
  GradeReviewQueryHandler,
  GradeReviewDetailQueryHandler,
  GradeReviewByTeacherQueryHandler,
  GradeReviewInCourseOfStudentQueryHandler,
];
export const CommandHandlers = [
  FinalizedGradeReviewCommandHandler,
  CreateGradeReviewCommandHandler,
  CreateGradeReviewResultCommandHandler,
  DeleteGradeReviewCommandHandler,
  ReAssignGradeReviewResultCommandHandler,
  UpdateGradeReviewCommandHandler,
];
