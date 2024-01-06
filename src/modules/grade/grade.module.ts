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
import { FirebaseModule, FirebaseModuleOptions } from 'utils/firebase';
import { ConfigService } from '@nestjs/config';

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
  imports: [
    FirebaseModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const firebase = configService.get<FirebaseModuleOptions>('firebase');
        return firebase;
      },
      inject: [ConfigService],
    }),
  ],
})
export class GradeModule {}
