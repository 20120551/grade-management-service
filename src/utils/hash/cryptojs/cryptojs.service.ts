import CryptoJS from 'crypto-js';
import { CryptoJSModuleOptions } from '.';
import { Inject, Injectable } from '@nestjs/common';

export const ICryptoJSService = 'ICryptoJSService';
export interface ICryptoJSService {
  encrypt<T>(message: T): string;
  decrypt<T>(message: string): T;
}
@Injectable()
export class CryptoJSService implements ICryptoJSService {
  constructor(
    @Inject(CryptoJSModuleOptions)
    private readonly _options: CryptoJSModuleOptions,
  ) {}

  encrypt<T>(message: T): string {
    let json = message as string;
    if (typeof message === 'object') {
      json = JSON.stringify(message);
    }
    const encrypted = CryptoJS.AES.encrypt(json, this._options.secretKey);
    return encrypted.toString();
  }

  decrypt<T>(message: string): T {
    const decrypted = CryptoJS.AES.decrypt(message, this._options.secretKey);
    const json = CryptoJS.enc.Utf8.stringify(decrypted);
    try {
      return JSON.parse(json) as T;
    } catch (err) {
      return json as T;
    }
  }
}
