import { IsNumber, IsString } from 'class-validator';

export class UpsertGradeReviewResultDto {
  @IsNumber()
  point: number;
  @IsString()
  feedback: string;
}

export class CreateGradeReviewResultDto extends UpsertGradeReviewResultDto {}

export class UpdateGradeReviewResultDto extends UpsertGradeReviewResultDto {}
