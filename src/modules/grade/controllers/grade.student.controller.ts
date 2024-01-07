import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { IGradeStudentService } from '../services';
import { FilterDto, UpsertGradeStudentDto } from '../resources/dto';
import { User } from 'utils/decorator/parameters';
import { AuthenticatedGuard, UseCoursePolicies, UserResponse } from 'guards';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserCourseRole } from '@prisma/client';

@UseGuards(AuthenticatedGuard)
@Controller('/api/grade/type/:id/student')
export class GradeStudentController {
  constructor(
    @Inject(IGradeStudentService)
    private readonly _gradeStudentService: IGradeStudentService,
  ) {}

  // get grade of grade type
  @UseCoursePolicies({ roles: [UserCourseRole.HOST, UserCourseRole.TEACHER] })
  @HttpCode(HttpStatus.OK)
  @Get('/grade')
  getGradeTypeGrade(
    @Param('id') gradeTypeId: string,
    @Query() filterDto: FilterDto,
  ) {
    return this._gradeStudentService.getGradeTypeGrade(gradeTypeId, filterDto);
  }

  // get grade of grade type in course
  @HttpCode(HttpStatus.OK)
  @Get()
  getStudentGradeInGradeType(
    @Param('id') gradeTypeId: string,
    @User() user: UserResponse,
  ) {
    return this._gradeStudentService.getStudentGradeInGradeType(
      user.userId,
      gradeTypeId,
    );
  }

  @UseCoursePolicies({ roles: [UserCourseRole.HOST, UserCourseRole.TEACHER] })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  addStudentGrade(
    @Param('id') gradeTypeId: string,
    @Body() upsertGradeStudentDto: UpsertGradeStudentDto,
  ) {
    return this._gradeStudentService.addCourseGrade(
      gradeTypeId,
      upsertGradeStudentDto,
    );
  }

  @UseCoursePolicies({ roles: [UserCourseRole.HOST, UserCourseRole.TEACHER] })
  @HttpCode(HttpStatus.OK)
  @Put()
  updateStudentGrade(
    @Param('id') gradeTypeId: string,
    @Body() upsertGradeStudentDto: UpsertGradeStudentDto,
  ) {
    return this._gradeStudentService.updateCourseGrade(
      gradeTypeId,
      upsertGradeStudentDto,
    );
  }

  @UseCoursePolicies({ roles: [UserCourseRole.HOST, UserCourseRole.TEACHER] })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete()
  deleteStudentGrade(
    @Param('id') gradeTypeId: string,
    @Query() { studentId }: { studentId: string },
  ) {
    return this._gradeStudentService.deleteCourseGrade(gradeTypeId, studentId);
  }

  @UseCoursePolicies({ roles: [UserCourseRole.HOST, UserCourseRole.TEACHER] })
  @HttpCode(HttpStatus.OK)
  @Put('/template/import')
  @UseInterceptors(FileInterceptor('file'))
  async batchCourseGrade(
    @UploadedFile(
      new ParseFilePipe({
        // max 10mb
        validators: [new MaxFileSizeValidator({ maxSize: 1000 * 1000 * 10 })],
      }),
    )
    file: Express.Multer.File,
    @Param('id') gradeTypeId: string,
  ) {
    const payload = {
      filename: file.originalname,
      buffer: file.buffer,
      mimeType: file.mimetype,
    };

    const userResponse = await this._gradeStudentService.batchCourseGrade(
      gradeTypeId,
      payload,
    );

    return userResponse;
  }

  @UseCoursePolicies({ roles: [UserCourseRole.HOST, UserCourseRole.TEACHER] })
  @HttpCode(HttpStatus.OK)
  @Get('/template/import')
  async downloadGradeTemplate(
    // @User() user: UserResponse,
    @Param('id') gradeTypeId: string,
  ) {
    const userResponse =
      await this._gradeStudentService.downloadGradeTemplate(gradeTypeId);

    return userResponse;
  }
}
