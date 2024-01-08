import { Module } from '@nestjs/common';
import {
  GradeStructureController,
  GradeStudentController,
} from './controllers';
import {
  GradeStructureService,
  GradeStudentService,
  GradeTypeService,
  IGradeStructureService,
  IGradeStudentService,
  IGradeTypeService,
} from './services';

@Module({
  controllers: [GradeStructureController, GradeStudentController],
  providers: [
    {
      provide: IGradeStructureService,
      useClass: GradeStructureService,
    },
    {
      provide: IGradeTypeService,
      useClass: GradeTypeService,
    },
    {
      provide: IGradeStudentService,
      useClass: GradeStudentService,
    },
  ],
})
export class GradeModule {}
