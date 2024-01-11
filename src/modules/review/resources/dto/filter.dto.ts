import { IsString } from 'class-validator';
import { defaultValue, parseInt } from 'utils/decorator/parameters';

export class FilterDto {
  @defaultValue(10, {
    filter: (obj) => obj.take === 0,
  })
  @parseInt()
  take?: number;

  @defaultValue(0)
  @parseInt()
  skip?: number;
}

export class GetGradeReviewFilterDto extends FilterDto {
  @IsString()
  gradeTypeId: string;
}

export class GetGradeReviewByTeacherFilterDto extends FilterDto {
  @IsString()
  gradeTypeId: string;
  @IsString()
  studentId: string;
}

export class GetGradeReviewInCourseOfStudentDto extends FilterDto {
  @IsString()
  gradeStructureId: string;
  @IsString()
  studentId: string;
}
