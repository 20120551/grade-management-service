import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from 'utils/prisma';
import { GradeReview } from '@prisma/client';
import { UpdateGradeReviewCommand } from '../updateGradeReview.command';

@CommandHandler(UpdateGradeReviewCommand)
export class UpdateGradeReviewCommandHandler
  implements ICommandHandler<UpdateGradeReviewCommand, GradeReview>
{
  constructor(private readonly _prismaService: PrismaService) {}

  execute(command: UpdateGradeReviewCommand): Promise<GradeReview> {
    const { gradeReviewId, ...payload } = command;
    return this._prismaService.gradeReview.update({
      where: {
        id: gradeReviewId,
      },
      data: payload,
    });
  }
}
