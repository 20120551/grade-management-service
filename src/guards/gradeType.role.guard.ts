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
export class GradeTypeRoleGuard implements CanActivate {
  constructor(
    private readonly _prismaService: PrismaService,
    private readonly _reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const id =
      req.body?.id ||
      req.body?.gradeTypeId ||
      req.params?.id ||
      req.params?.gradeTypeId ||
      req.query?.id ||
      req.query?.gradeTypeId;

    const { userId } = req.user;

    const gradeType = await this._prismaService.gradeType.findUnique({
      where: {
        id,
      },
      select: {
        gradeStructure: {
          select: {
            courseId: true,
          },
        },
      },
    });

    if (!gradeType?.gradeStructure?.courseId) {
      throw new UnauthorizedException("You don't have permission");
    }

    const { role } = await this._prismaService.userCourse.findFirst({
      where: {
        courseId: gradeType.gradeStructure.courseId,
        userId,
      },
    });

    const allowRoles = this._reflector.getAllAndOverride<any[]>(
      COURSE_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    console.log(role, allowRoles);

    if (allowRoles.flat().some((_role) => _role === role)) {
      return true;
    }

    return false;
  }
}

export const UseGradeTypePolicies = (
  options: UseCourseRoleOptions,
): ClassDecorator & MethodDecorator => {
  return (target: Function, prop?: string, descriptor?: PropertyDescriptor) => {
    CourseRoles(options.roles)(target, prop, descriptor);
    UseGuards(GradeTypeRoleGuard)(target, prop, descriptor);
  };
};
