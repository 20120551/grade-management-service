import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { COURSE_ROLES_KEY, POLICIES_KEY } from 'configurations/role.config';
import { Request } from 'express';
import { CoursePolicies, CourseRoles, UseCourseRoleOptions } from 'guards';
import { isEmpty } from 'lodash';
import { UnauthorizedException } from 'utils/errors/domain.error';
import { PrismaService } from 'utils/prisma';

@Injectable()
export class GradeReviewRoleGuard implements CanActivate {
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

    const course = await this._prismaService.userCourse.findFirst({
      where: {
        courseId: gradeReview.userCourseGrade.courseId,
        userId,
      },
    });

    const role = course?.role;
    if (!role) {
      return false;
    }

    const allowRoles = this._reflector.getAllAndOverride<any[]>(
      COURSE_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const policies = this._reflector.getAllAndOverride<any[]>(POLICIES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    req.course = {
      courseId: gradeReview.userCourseGrade.courseId,
    };

    if (isEmpty(allowRoles) && isEmpty(policies)) {
      return true;
    } else if (isEmpty(allowRoles)) {
      if (userId === gradeReview.userId) {
        return true;
      }
    } else if (isEmpty(policies)) {
      if (allowRoles.flat().some((_role) => _role === role)) {
        return true;
      }
    } else {
      if (
        allowRoles.flat().some((_role) => _role === role) &&
        userId === gradeReview.userId
      ) {
        return true;
      }
    }

    return false;
  }
}

export const UseGradeReviewPolicies = (
  options: UseCourseRoleOptions,
): ClassDecorator & MethodDecorator => {
  return (target: Function, prop?: string, descriptor?: PropertyDescriptor) => {
    CourseRoles(options.roles)(target, prop, descriptor);
    CoursePolicies(options.policies)(target, prop, descriptor);
    UseGuards(GradeReviewRoleGuard)(target, prop, descriptor);
  };
};
