import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from 'utils/prisma';
import { DeleteGradeReviewCommand } from '../deleteGradeReview.command';

@CommandHandler(DeleteGradeReviewCommand)
export class DeleteGradeReviewCommandHandler
  implements ICommandHandler<DeleteGradeReviewCommand, void>
{
  constructor(private readonly _prismaService: PrismaService) {}

  async execute(command: DeleteGradeReviewCommand): Promise<void> {
    const { gradeReviewId } = command;
    await this._prismaService.gradeReview.delete({
      where: {
        id: gradeReviewId,
      },
    });
  }
}
