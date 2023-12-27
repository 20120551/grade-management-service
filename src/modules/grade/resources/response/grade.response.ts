import { Stream } from 'stream';

export interface StudentGradeTemplateResponse {
  fileName: string;
  ext: string;
  buffer: Buffer | Stream;
}

export interface StudentGradeResponse {
  point: number;
  studentId?: string;
}

export interface GradeBoardResponse {
  fileName: string;
  ext: string;
  buffer: Buffer | Stream;
}

export interface GradeBoardHeader {
  name: string;
  width: number;
  subHeaders?: GradeBoardHeader[];
  id?: string;
}
