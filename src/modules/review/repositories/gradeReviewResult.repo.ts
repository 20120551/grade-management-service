import { PrismaService } from 'utils/prisma';
import { plainToInstance } from 'class-transformer';
import { GradeReviewEntity } from '../entities';
import { GradeReviewResult, PrismaClient } from '@prisma/client';
import { Injectable } from '@nestjs/common';

export const IGradeReviewRepo = 'IGradeReviewRepo';
export interface IGradeReviewRepo {
  findById(aggregateId: string): Promise<GradeReviewEntity | null>;
  persist(entity: GradeReviewEntity): Promise<void>;
}

@Injectable()
export class GradeReviewRepo implements IGradeReviewRepo {
  constructor(private readonly _prismaService: PrismaService) {}

  async findById(aggregateId: string): Promise<GradeReviewEntity> {
    const aggregation = await this._prismaService.gradeReview.findUnique({
      where: {
        id: aggregateId,
      },
      include: {
        gradeReviewResults: true,
      },
    });

    const { gradeReviewResults: events, ...payload } = aggregation;
    const entity = plainToInstance(GradeReviewEntity, payload);
    entity.loadFromHistory(events);
    return entity;
  }

  async persist(entity: GradeReviewEntity): Promise<void> {
    const lastEvent = await this._findLastEvent(entity.id);
    const lastVersion = lastEvent ? lastEvent.version : 0;

    const events = entity.getUncommittedEvents().map((data, index) => ({
      ...data,
      version: lastVersion + index + 1,
    }));

    await this._prismaService.gradeReviewResult.createMany({
      data: events,
    });

    entity.commit();
  }

  private async _findLastEvent(
    aggregateId: string,
  ): Promise<GradeReviewResult> {
    const events = await this._prismaService.gradeReviewResult.findMany({
      where: {
        gradeReviewId: aggregateId,
      },
      orderBy: [
        {
          version: 'desc',
        },
      ],
    });

    return events[0];
  }
}
