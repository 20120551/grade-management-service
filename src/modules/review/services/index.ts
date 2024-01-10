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
} from './queries/handlers';

export const QueryHandlers = [
  GradeReviewQueryHandler,
  GradeReviewDetailQueryHandler,
];
export const CommandHandlers = [
  FinalizedGradeReviewCommandHandler,
  CreateGradeReviewCommandHandler,
  CreateGradeReviewResultCommandHandler,
  DeleteGradeReviewCommandHandler,
  ReAssignGradeReviewResultCommandHandler,
  UpdateGradeReviewCommandHandler,
];
