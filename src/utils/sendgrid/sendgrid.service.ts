import SendGrid from '@sendgrid/mail';
import { SendgridModuleOptions } from '.';
import { Inject, Injectable } from '@nestjs/common';

export const ISendgridService = 'ISendgridService';
export interface ISendgridService {
  send(mail: SendGrid.MailDataRequired): Promise<void>;
}
@Injectable()
export class SendgridService implements ISendgridService {
  constructor(
    @Inject(SendgridModuleOptions)
    _options: SendgridModuleOptions,
  ) {
    SendGrid.setApiKey(_options.apiKey);
  }

  async send(mail: SendGrid.MailDataRequired): Promise<void> {
    await SendGrid.send(mail);
  }
}
