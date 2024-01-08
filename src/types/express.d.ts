import { UserResponse, CourseResponse } from 'guards';

declare module '@types/express-serve-static-core' {
  interface Request {
    user?: UserResponse;
    course?: CourseResponse;
  }
}
