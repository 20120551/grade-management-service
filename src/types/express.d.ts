import { UserResponse } from 'modules/user/resources/response';

declare module '@types/express-serve-static-core' {
  interface Request {
    user?: UserResponse;
  }
}
