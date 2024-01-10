import { IsOptional, IsString, Max, Min } from 'class-validator';

export class UpsertGradeStudentDto {
  @Min(0)
  @Max(10)
  point: number;
  studentId: string;
}

export class UpsertGradeStudentByGradeTypeDto {
  @Min(0)
  @Max(10)
  @IsOptional()
  point: number;
  @IsString()
  gradeTypeId: string;
}
