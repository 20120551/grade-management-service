import { GradeStatus } from '@prisma/client';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { defaultValue } from 'utils/decorator/parameters';
import { CreateGradeTypeDto } from './upsertGradeType.dto';
import { Type } from 'class-transformer';

export class CreateGradeStructureDto {
  @IsString()
  courseId: string;
  @IsString()
  name: string;
  @defaultValue(GradeStatus.CREATED)
  status: GradeStatus;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGradeTypeDto)
  gradeTypes?: CreateGradeTypeDto[];
}

export class UpdateGradeStructureDto {
  name?: string;
  status?: GradeStatus;
}
