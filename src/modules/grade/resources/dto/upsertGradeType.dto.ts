import { GradeStatus, SupportedGradeType } from '@prisma/client';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { defaultValue } from 'utils/decorator/parameters';

export class CreateGradeTypeDto {
  @IsNumber()
  percentage: number;
  @defaultValue(SupportedGradeType.PARENT)
  type: SupportedGradeType;
  @IsString()
  label: string;
  @IsOptional()
  desc: string;
  @defaultValue(GradeStatus.CREATED)
  status: GradeStatus;
  @defaultValue(() => new Date().toISOString())
  updatedAt: string;
}

export class CreateSubGradeTypeDto {
  @IsNumber()
  percentage: number;
  @defaultValue(SupportedGradeType.SUB)
  type: SupportedGradeType;
  @IsString()
  label: string;
  @IsOptional()
  desc: string;
  @defaultValue(GradeStatus.CREATED)
  status: GradeStatus;
}

export class UpdateGradeTypeDto {
  percentage?: number;
  label?: string;
  desc?: string;
}

export class FinalizeGradeTypeDto {
  @IsString()
  status: GradeStatus;
}
