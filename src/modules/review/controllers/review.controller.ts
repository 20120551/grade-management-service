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
  CourseRoleGuard,
  UseGradeReviewPolicies,
  UseGradeReviewResultPolicies,
  UserResponse,
} from 'guards';
import { User } from 'utils/decorator/parameters';
import {
  CreateGradeReviewDto,
  CreateGradeReviewResultDto,
  FilterDto,
  GetGradeReviewFilterDto,
  UpdateGradeReviewDto,
  UpdateGradeReviewResultDto,
} from '../resources/dto';
import {
  CloseGradeReviewResultCommand,
  CreateGradeReviewCommand,
  CreateGradeReviewResultCommand,
  DeleteGradeReviewCommand,
  ReAssignGradeReviewResultCommand,
  UpdateGradeReviewCommand,
} from '../services/commands';
import { plainToInstance } from 'class-transformer';
import { GetGradeReviewQuery } from '../services/queries';
import { UserCourseRole } from '@prisma/client';

@UseGuards(AuthenticatedGuard)
@Controller('api/grade/review')
export class ReviewController {
  constructor(
    private readonly _commandBus: CommandBus,
    private readonly _queryBus: QueryBus,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get('')
  getGradeReview(@Query() filter: GetGradeReviewFilterDto) {
    const query = plainToInstance(GetGradeReviewQuery, filter);
    return this._queryBus.execute(query);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('')
  createGradeReview(
    @User() user: UserResponse,
    @Body() createGradeReviewDto: CreateGradeReviewDto,
  ) {
    const command = plainToInstance(CreateGradeReviewCommand, {
      userId: user.userId,
      ...createGradeReviewDto,
    });

    return this._commandBus.execute(command);
  }

  @UseGradeReviewPolicies({
    roles: [UserCourseRole.HOST, UserCourseRole.TEACHER],
  })
  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  getGradeReviewDetail(@Param('id') id: string, @Query() filter: FilterDto) {
    const query = plainToInstance(GetGradeReviewQuery, {
      gradeReviewId: id,
      ...filter,
    });

    return this._queryBus.execute(query);
  }

  @UseGradeReviewPolicies({
    roles: [UserCourseRole.HOST, UserCourseRole.TEACHER],
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

  @UseGradeReviewResultPolicies({
    roles: [UserCourseRole.HOST, UserCourseRole.TEACHER],
  })
  @HttpCode(HttpStatus.OK)
  @Put('/:id/result/close')
  closeGradeReviewResult(
    @Param('id') id: string,
    @User() user: UserResponse,
    @Body() updateGradeReviewResultDto: UpdateGradeReviewResultDto,
  ) {
    const command = plainToInstance(CloseGradeReviewResultCommand, {
      gradeReviewId: id,
      teacherId: user.userId,
      ...updateGradeReviewResultDto,
    });

    return this._commandBus.execute(command);
  }
}
