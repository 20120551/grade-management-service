export type UserProviderSupport = 'google-oauth2' | 'facebook' | 'auth0';
export interface UserUserIdentity {
  userId: string;
  provider: UserProviderSupport;
  connection: string;
  isSocial: boolean;
}

export interface UserMetadata {
  [index: string]: unknown;
}
export interface UserAppMetadata {
  [index: string]: unknown;
}

export interface UserResponse {
  email: string;
  emailVerified: boolean;
  identities: UserUserIdentity;
  name: string;
  nickname: string;
  picture: string;
  userId: string;
  userMetadata: UserMetadata;
  appMetadata: UserAppMetadata;
}
export * from './authenticated.guard';
export * from './course.role.guard';
