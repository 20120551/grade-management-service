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
  UseInterceptors,
} from '@nestjs/common';
import { IGradeStudentService } from '../services';
import { FilterDto, UpsertGradeStudentDto } from '../resources/dto';
import { User } from 'utils/decorator/parameters';
import { UserResponse } from 'guards';
import { FileInterceptor } from '@nestjs/platform-express';

// @UseGuards(AuthenticatedGuard)
@Controller('/api/grade/type/:id/student')
export class GradeStudentController {
  constructor(
    @Inject(IGradeStudentService)
    private readonly _gradeStudentService: IGradeStudentService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get('/grade')
  getGradeTypeGrade(
    @Param('id') gradeTypeId: string,
    @Query() filterDto: FilterDto,
  ) {
    return this._gradeStudentService.getGradeTypeGrade(gradeTypeId, filterDto);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  getStudentGrade(
    @Query() { courseId }: { courseId: string },
    @Param('id') gradeTypeId: string,
    @User() user: UserResponse,
  ) {
    return this._gradeStudentService.getCourseGrade(
      user.userId,
      courseId,
      gradeTypeId,
    );
  }

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

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete()
  deleteStudentGrade(
    @Param('id') gradeTypeId: string,
    @Query() { studentId }: { studentId: string },
  ) {
    return this._gradeStudentService.deleteCourseGrade(gradeTypeId, studentId);
  }

  @HttpCode(HttpStatus.OK)
  @Put('/template/import')
  @UseInterceptors(FileInterceptor('file'))
  async uploadStudentCard(
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

  @HttpCode(HttpStatus.OK)
  @Get('/template/import')
  async updateStudentCard(
    // @User() user: UserResponse,
    @Param('id') gradeTypeId: string,
  ) {
    const userResponse =
      await this._gradeStudentService.downloadGradeTemplate(gradeTypeId);

    return userResponse;
  }
}
