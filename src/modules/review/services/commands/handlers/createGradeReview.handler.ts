import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateGradeReviewCommand } from '../createGradeReview.command';
import { PrismaService } from 'utils/prisma';
import { GradeReview } from '@prisma/client';

@CommandHandler(CreateGradeReviewCommand)
export class CreateGradeReviewCommandHandler
  implements ICommandHandler<CreateGradeReviewCommand, GradeReview>
{
  constructor(private readonly _prismaService: PrismaService) {}

  execute(command: CreateGradeReviewCommand): Promise<GradeReview> {
    return this._prismaService.gradeReview.create({
      data: command,
    });
  }
}
