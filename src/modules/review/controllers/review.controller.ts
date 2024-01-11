import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  AuthenticatedGuard,
  CoursePolicy,
  CourseResponse,
  UseGradeReviewPolicies,
  UseGradeReviewResultPolicies,
  UseGradeStructurePolicies,
  UseGradeTypePolicies,
  UserResponse,
} from 'guards';
import { Course, User } from 'utils/decorator/parameters';
import {
  CreateGradeReviewDto,
  CreateGradeReviewResultDto,
  FilterDto,
  FinalizedGradeReviewDto,
  GetGradeReviewByTeacherFilterDto,
  GetGradeReviewFilterDto,
  GetGradeReviewInCourseOfStudentDto,
  UpdateGradeReviewDto,
  UpdateGradeReviewResultDto,
} from '../resources/dto';
import {
  CreateGradeReviewCommand,
  CreateGradeReviewResultCommand,
  DeleteGradeReviewCommand,
  FinalizedGradeReviewCommand,
  ReAssignGradeReviewResultCommand,
  UpdateGradeReviewCommand,
} from '../services/commands';
import { plainToInstance } from 'class-transformer';
import {
  GetGradeReviewByTeacherQuery,
  GetGradeReviewDetailQuery,
  GetGradeReviewInCourseOfStudentQuery,
  GetGradeReviewQuery,
} from '../services/queries';
import { UserCourseRole } from '@prisma/client';

@UseGuards(AuthenticatedGuard)
@Controller('api/review/grade')
export class ReviewController {
  constructor(
    private readonly _commandBus: CommandBus,
    private readonly _queryBus: QueryBus,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get('')
  getGradeReview(
    @Query() filter: GetGradeReviewFilterDto,
    @User() user: UserResponse,
  ) {
    const query = plainToInstance(GetGradeReviewQuery, {
      ...filter,
      userId: user.userId,
    });
    return this._queryBus.execute(query);
  }

  @UseGradeStructurePolicies({
    roles: [
      UserCourseRole.TEACHER,
      UserCourseRole.HOST,
      UserCourseRole.STUDENT,
    ],
  })
  @HttpCode(HttpStatus.OK)
  @Get('course')
  getGradeReviewInCourseOfStuent(
    @Query() filter: GetGradeReviewInCourseOfStudentDto,
    @Course() course: CourseResponse,
  ) {
    const query = plainToInstance(GetGradeReviewInCourseOfStudentQuery, {
      ...filter,
      courseId: course.courseId,
    });
    return this._queryBus.execute(query);
  }

  @UseGradeTypePolicies({
    roles: [UserCourseRole.TEACHER, UserCourseRole.HOST],
  })
  @HttpCode(HttpStatus.OK)
  @Get('view')
  getGradeReviewUsesByTeacher(
    @Query() filter: GetGradeReviewByTeacherFilterDto,
  ) {
    const query = plainToInstance(GetGradeReviewByTeacherQuery, {
      ...filter,
    });
    return this._queryBus.execute(query);
  }

  @UseGradeTypePolicies({ roles: [UserCourseRole.STUDENT] })
  @HttpCode(HttpStatus.CREATED)
  @Post('')
  createGradeReview(
    @User() user: UserResponse,
    @Body() createGradeReviewDto: CreateGradeReviewDto,
    @Course() course: CourseResponse,
  ) {
    const command = plainToInstance(CreateGradeReviewCommand, {
      userId: user.userId,
      courseId: course.courseId,
      ...createGradeReviewDto,
    });

    return this._commandBus.execute(command);
  }

  @UseGradeReviewPolicies({
    roles: [
      UserCourseRole.HOST,
      UserCourseRole.TEACHER,
      UserCourseRole.STUDENT,
    ],
  })
  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  getGradeReviewDetail(@Param('id') id: string, @Query() filter: FilterDto) {
    const query = plainToInstance(GetGradeReviewDetailQuery, {
      gradeReviewId: id,
      ...filter,
    });

    return this._queryBus.execute(query);
  }

  @UseGradeReviewPolicies({
    policies: [CoursePolicy.OWNER],
  })
  @HttpCode(HttpStatus.OK)
  @Put('/:id')
  updateGradeReview(
    @Param('id') id: string,
    @Body() updateGradeReviewDto: UpdateGradeReviewDto,
  ) {
    const command = plainToInstance(UpdateGradeReviewCommand, {
      gradeReviewId: id,
      ...updateGradeReviewDto,
    });

    return this._commandBus.execute(command);
  }

  @UseGradeReviewPolicies({
    roles: [UserCourseRole.HOST, UserCourseRole.TEACHER],
  })
  @HttpCode(HttpStatus.OK)
  @Put('/:id/finalized')
  finalizedGradeReview(
    @Param('id') id: string,
    @User() user: UserResponse,
    @Body() finalizedGradeReviewDto: FinalizedGradeReviewDto,
  ) {
    const command = plainToInstance(FinalizedGradeReviewCommand, {
      gradeReviewId: id,
      finalizedBy: user.userId,
      ...finalizedGradeReviewDto,
    });

    return this._commandBus.execute(command);
  }

  @UseGradeReviewPolicies({
    roles: [UserCourseRole.HOST, UserCourseRole.TEACHER],
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:id')
  deleteGradeReview(@Param('id') id: string) {
    const command = plainToInstance(DeleteGradeReviewCommand, {
      gradeReviewId: id,
    });

    return this._commandBus.execute(command);
  }

  @UseGradeReviewResultPolicies({
    roles: [UserCourseRole.HOST, UserCourseRole.TEACHER],
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('/:id/result')
  createGradeReviewResult(
    @Param('id') id: string,
    @User() user: UserResponse,
    @Body() createGradeReviewResultDto: CreateGradeReviewResultDto,
  ) {
    const command = plainToInstance(CreateGradeReviewResultCommand, {
      gradeReviewId: id,
      teacherId: user.userId,
      ...createGradeReviewResultDto,
    });

    return this._commandBus.execute(command);
  }

  @UseGradeReviewResultPolicies({
    roles: [UserCourseRole.HOST, UserCourseRole.TEACHER],
  })
  @HttpCode(HttpStatus.OK)
  @Put('/:id/result/re-assign')
  reassignGradeReviewResult(
    @Param('id') id: string,
    @User() user: UserResponse,
    @Body() updateGradeReviewResultDto: UpdateGradeReviewResultDto,
  ) {
    const command = plainToInstance(ReAssignGradeReviewResultCommand, {
      gradeReviewId: id,
      teacherId: user.userId,
      ...updateGradeReviewResultDto,
    });

    return this._commandBus.execute(command);
  }
}
