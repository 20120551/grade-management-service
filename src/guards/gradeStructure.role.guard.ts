import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserCourseRole } from '@prisma/client';
import { COURSE_ROLES_KEY } from 'configurations/role.config';
import { Request } from 'express';
import { CourseRoles, UseCourseRoleOptions } from 'guards';
import { UnauthorizedException } from 'utils/errors/domain.error';
import { PrismaService } from 'utils/prisma';

@Injectable()
export class GradeStructureRoleGuard implements CanActivate {
  constructor(
    private readonly _prismaService: PrismaService,
    private readonly _reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const id =
      req.body?.id ||
      req.body?.gradeStructureId ||
      req.params?.id ||
      req.params?.gradeStructureId ||
      req.query?.id ||
      req.query?.gradeStructureId;

    if (!id) {
      throw new UnauthorizedException("you don't have permission");
    }

    const { userId } = req.user;
    const gradeStructure = await this._prismaService.gradeStructure.findUnique({
      where: {
        id,
      },
      select: {
        courseId: true,
      },
    });

    if (!gradeStructure?.courseId) {
      throw new UnauthorizedException("You don't have permission");
    }

    const course = await this._prismaService.userCourse.findFirst({
      where: {
        courseId: gradeStructure.courseId,
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

    req.course = {
      courseId: gradeStructure.courseId,
    };
    if (allowRoles.flat().some((_role) => _role === role)) {
      return true;
    }

    return false;
  }
}

export const UseGradeStructurePolicies = (
  options: UseCourseRoleOptions,
): ClassDecorator & MethodDecorator => {
  return (target: Function, prop?: string, descriptor?: PropertyDescriptor) => {
    CourseRoles(options.roles)(target, prop, descriptor);
    UseGuards(GradeStructureRoleGuard)(target, prop, descriptor);
  };
};
