import { ModuleMetadata, Provider, Type } from '@nestjs/common';

// OPTION //
export const Auth0ModuleOptions = 'Auth0ModuleOptions';
export interface Auth0ModuleOptions {
  grantType: string;
  clientId: string;
  clientSecret: string;
  baseUrl: string;
}

export interface Auth0OptionsFactory {
  createAuth0Options(): Promise<Auth0ModuleOptions> | Auth0ModuleOptions;
}

export interface Auth0ModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  global?: boolean;
  useFactory?: (
    ...args: any[]
  ) => Promise<Auth0ModuleOptions> | Auth0ModuleOptions;
  inject?: any[];
  useExisting?: Type<Auth0OptionsFactory>;
  useClass?: Type<Auth0OptionsFactory>;
  providers?: Provider[];
}

// LOGIN //
export interface Auth0ResourceOwnerLogin {
  client_id: string;
  email: string;
  client_secret: string;
  scope: string;
  username: string;
  password: string;
}

export interface Auth0Signup {
  client_id: string;
  connection: string;
  email: string;
  username: string;
  password: string;
}

export type Auth0SupportedSocialLogin = 'google-oauth2' | 'facebook';
export interface Auth0SocialLogin {
  client_id: string;
  response_type: 'code' | 'token';
  connection: Auth0SupportedSocialLogin;
  redirect_uri: string;
  state?: string;
  access_type?: string;
}

// TOKEN //
export interface Auth0AccessToken {
  access_token: string;
}

export interface Auth0PairToken extends Auth0AccessToken {
  refresh_token: string;
}

export type Auth0ProviderSupport = 'google-oauth2' | 'facebook' | 'auth0';
export interface Auth0UserIdentity {
  user_id: string;
  provider: Auth0ProviderSupport;
  connection: string;
  isSocial: boolean;
}

export interface Auth0UserMetadata {
  [index: string]: unknown;
}
export interface Auth0AppMetadata {
  [index: string]: unknown;
}

export interface Auth0UserInfo {
  email: string;
  email_verified: boolean;
  identities: Auth0UserIdentity;
  name: string;
  nickname: string;
  picture: string;
  user_id: string;
  user_metadata: Auth0UserMetadata;
  app_metadata: Auth0AppMetadata;
}

export * from './auth0.service';
export * from './auth0.module';
