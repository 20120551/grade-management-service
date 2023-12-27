import { Inject, Injectable } from '@nestjs/common';
import { Auth0AccessToken, Auth0ModuleOptions, Auth0UserInfo } from '.';
import axios, { AxiosInstance } from 'axios';

export const IAuth0Service = 'IAuth0Service';
export interface IAuth0Service {
  signToken(): Promise<Auth0AccessToken>;
  verifyToken(token: Auth0AccessToken): Promise<Auth0UserInfo>;
}

@Injectable()
export class Auth0Service implements IAuth0Service {
  private readonly _auth0Client: AxiosInstance;
  constructor(
    @Inject(Auth0ModuleOptions)
    private readonly _auth0Options: Auth0ModuleOptions,
  ) {
    this._auth0Client = axios.create({
      baseURL: _auth0Options.baseUrl,
    });
  }
  async verifyToken(token: Auth0AccessToken): Promise<Auth0UserInfo> {
    const res = await this._auth0Client.get('/userinfo', {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    });
    return res.data as Auth0UserInfo;
  }

  async signToken(): Promise<Auth0AccessToken> {
    const { clientId, clientSecret, grantType, baseUrl } = this._auth0Options;

    const res = await this._auth0Client.post('/oauth/token', {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: grantType,
      audience: `${baseUrl}/api/v2/`,
    });
    return res.data as Auth0AccessToken;
  }
}
