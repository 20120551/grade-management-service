import { GradeReviewStatus } from '@prisma/client';
import { IsNumber, IsString } from 'class-validator';
import { defaultValue } from 'utils/decorator/parameters';

export class UpsertGradeReviewDto {
  @IsNumber()
  expectedGrade: number;
  @IsString()
  topic: string;
  @IsString()
  desc: string;
}

export class CreateGradeReviewDto extends UpsertGradeReviewDto {
  @IsString()
  gradeTypeId: string;
  @defaultValue(GradeReviewStatus.REQUEST)
  status: GradeReviewStatus;
}

export class UpdateGradeReviewDto extends UpsertGradeReviewDto {}
export class FinalizedGradeReviewDto {}
