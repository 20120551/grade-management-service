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

export class GradeStructureFilterDto extends FilterDto {}
export class GradeStructureFilterByCourseIdDto extends GradeStructureFilterDto {
  @IsString()
  courseId: string;
}
export class GradeTypeFilterDto extends FilterDto {}
