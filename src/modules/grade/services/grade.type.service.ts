import { GradeType, PrismaClient, SupportedGradeType } from '@prisma/client';
import { PrismaService } from 'utils/prisma';
import { BatchResponse } from '../resources/response';
import {
  CreateGradeTypeDto,
  CreateSubGradeTypeDto,
  GradeTypeFilterDto,
  UpdateGradeTypeDto,
} from '../resources/dto';
import { BadRequestException } from 'utils/errors/domain.error';
import { Injectable } from '@nestjs/common';
import { differenceBy, isEmpty } from 'lodash';
import BPromise from 'bluebird';

export const IGradeTypeService = 'IGradeTypeService';
export interface IGradeTypeService {
  getGradeType(
    gradeTypeId: string,
    options: GradeTypeFilterDto,
  ): Promise<GradeType>;
  createGradeType(
    gradeStructureId: string,
    createGradeType: CreateGradeTypeDto,
  ): Promise<GradeType>;
  batchGradeType(
    gradeStructureId: string,
    createGradeTypes: CreateGradeTypeDto[],
  ): Promise<BatchResponse>;
  updateGradeType(
    gradeTypeId: string,
    updateGradeTypeDto: UpdateGradeTypeDto,
  ): Promise<GradeType>;
  deleteGradeType(gradeTypeId: string): Promise<void>;
  addSubGradeType(
    gradeTypeId: string,
    createSubGradeType: CreateSubGradeTypeDto,
  ): Promise<GradeType>;
  batchSubGradeType(
    gradeTypeId: string,
    createSubGradeTypes: CreateSubGradeTypeDto[],
  ): Promise<BatchResponse>;
}

@Injectable()
export class GradeTypeService implements IGradeTypeService {
  constructor(
    private readonly _prisma: PrismaClient,
    private readonly _prismaService: PrismaService,
  ) {}

  async getGradeType(
    gradeTypeId: string,
    options: GradeTypeFilterDto,
  ): Promise<GradeType> {
    const result = await this._prismaService.gradeType.findUnique({
      where: {
        id: gradeTypeId,
      },
      include: {
        gradeSubTypes: {
          skip: options.skip,
          take: options.take,
        },
      },
    });

    if (!result) {
      throw new BadRequestException(
        `Not found grade type at id ${gradeTypeId}`,
      );
    }

    return result;
  }

  async createGradeType(
    gradeStructureId: string,
    createGradeType: CreateGradeTypeDto,
  ): Promise<GradeType> {
    const gradeTypes = await this._prismaService.gradeType.findMany({
      where: {
        gradeStructureId,
      },
    });

    if (
      !gradeTypes &&
      !isEmpty(gradeTypes) &&
      gradeTypes.some((gradeType) => gradeType.label === createGradeType.label)
    ) {
      throw new BadRequestException(`${createGradeType.label} has existed`);
    }

    const result = await this._prismaService.gradeType.create({
      data: {
        gradeStructureId,
        ...createGradeType,
      },
    });

    return result;
  }

  async batchGradeType(
    gradeStructureId: string,
    createGradeTypes: CreateGradeTypeDto[],
  ): Promise<BatchResponse> {
    const gradeTypes = await this._prismaService.gradeType.findMany({
      where: {
        gradeStructureId,
      },
    });

    const gradeTypeMap = new Map(
      gradeTypes.map((data) => [data.label, { ...data }]),
    );

    const createBatch = differenceBy(createGradeTypes, gradeTypes, 'label');

    const updateBatch = createGradeTypes
      .map((gradeType) => {
        if (gradeTypeMap.has(gradeType.label)) {
          return {
            ...gradeTypeMap.get(gradeType.label),
          };
        }

        return null;
      })
      .filter(Boolean);

    const result = await this._prisma.$transaction(async (context) => {
      const result = await context.gradeType.createMany({
        data: createBatch.map((data) => ({ ...data, gradeStructureId })),
      });

      await BPromise.mapSeries(updateBatch, (data) =>
        context.gradeType.update({
          where: {
            id: data.id,
          },
          data,
        }),
      );

      return result;
    });

    return result;
  }

  async updateGradeType(
    gradeTypeId: string,
    updateGradeTypeDto: UpdateGradeTypeDto,
  ): Promise<GradeType> {
    const result = await this._prismaService.gradeType.update({
      where: {
        id: gradeTypeId,
      },
      data: {
        ...updateGradeTypeDto,
      },
    });

    return result;
  }

  async deleteGradeType(gradeTypeId: string): Promise<void> {
    await this._prismaService.gradeType.delete({
      where: {
        id: gradeTypeId,
      },
    });
  }

  async addSubGradeType(
    gradeTypeId: string,
    createSubGradeType: CreateSubGradeTypeDto,
  ): Promise<GradeType> {
    const gradeType = await this._prismaService.gradeType.findUnique({
      where: {
        id: gradeTypeId,
      },
      include: {
        gradeSubTypes: {
          select: {
            label: true,
          },
        },
      },
    });

    if (
      !gradeType &&
      !isEmpty(gradeType.gradeSubTypes) &&
      gradeType.gradeSubTypes.some(
        (gradeType) => gradeType.label === createSubGradeType.label,
      )
    ) {
      throw new BadRequestException(`${createSubGradeType.label} has existed`);
    }

    const result = await this._prismaService.gradeType.update({
      where: {
        id: gradeTypeId,
      },
      data: {
        gradeSubTypes: {
          create: {
            gradeStructureId: gradeType.gradeStructureId,
            ...createSubGradeType,
          },
        },
      },
    });

    return result;
  }

  async batchSubGradeType(
    gradeTypeId: string,
    createSubGradeTypes: CreateSubGradeTypeDto[],
  ): Promise<BatchResponse> {
    const gradeType = await this._prismaService.gradeType.findUnique({
      where: {
        id: gradeTypeId,
      },
      include: {
        gradeSubTypes: {
          select: {
            id: true,
            label: true,
          },
        },
      },
    });

    if (!gradeType) {
      throw new BadRequestException(`Not found grade type ${gradeTypeId}`);
    }
    const gradeTypeMap = new Map(
      gradeType.gradeSubTypes.map((data) => [data.label, { ...data }]),
    );

    const createBatch = differenceBy(
      createSubGradeTypes,
      gradeType.gradeSubTypes,
      'label',
    );

    const updateBatch = createSubGradeTypes
      .map((gradeType) => {
        if (gradeTypeMap.has(gradeType.label)) {
          return {
            ...gradeTypeMap.get(gradeType.label),
          };
        }

        return null;
      })
      .filter(Boolean);

    const result = await this._prisma.$transaction(async (context) => {
      const result = await context.gradeType.createMany({
        data: createBatch.map((data) => ({
          ...data,
          gradeStructureId: gradeType.gradeStructureId,
          parentId: gradeType.id,
        })),
      });

      await BPromise.mapSeries(updateBatch, async (data) =>
        context.gradeType.update({
          where: {
            id: data.id,
          },
          data,
        }),
      );

      return result;
    });

    return result;
  }
}
