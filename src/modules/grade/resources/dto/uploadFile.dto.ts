import { IsString } from 'class-validator';

export class UploadFileDto {
  buffer: Buffer;
  @IsString()
  filename: string;
  mimeType: string;
}
