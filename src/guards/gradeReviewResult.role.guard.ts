import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { COURSE_ROLES_KEY } from 'configurations/role.config';
import { Request } from 'express';
import { CourseRoles, UseCourseRoleOptions } from 'guards';
import { UnauthorizedException } from 'utils/errors/domain.error';
import { PrismaService } from 'utils/prisma';

@Injectable()
export class GradeReviewResultRoleGuard implements CanActivate {
  constructor(
    private readonly _prismaService: PrismaService,
    private readonly _reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const id =
      req.body?.id ||
      req.body?.gradeReviewId ||
      req.params?.id ||
      req.params?.gradeReviewId ||
      req.query?.id ||
      req.query?.gradeReviewId;

    if (!id) {
      throw new UnauthorizedException("you don't have permission");
    }

    const { userId } = req.user;

    const gradeReview = await this._prismaService.gradeReview.findUnique({
      where: {
        id,
      },
      select: {
        userId: true,
        userCourseGrade: {
          select: {
            courseId: true,
          },
        },
      },
    });

    if (!gradeReview?.userCourseGrade?.courseId) {
      throw new UnauthorizedException("You don't have permission");
    }

    const { role } = await this._prismaService.userCourse.findFirst({
      where: {
        courseId: gradeReview.userCourseGrade.courseId,
        userId,
      },
    });

    const allowRoles = this._reflector.getAllAndOverride<any[]>(
      COURSE_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    req.course = {
      courseId: gradeReview.userCourseGrade.courseId,
    };
    if (allowRoles.flat().some((_role) => _role === role)) {
      return true;
    }

    return false;
  }
}

export const UseGradeReviewResultPolicies = (
  options: UseCourseRoleOptions,
): ClassDecorator & MethodDecorator => {
  return (target: Function, prop?: string, descriptor?: PropertyDescriptor) => {
    CourseRoles(options.roles)(target, prop, descriptor);
    UseGuards(GradeReviewResultRoleGuard)(target, prop, descriptor);
  };
};
