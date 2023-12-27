import { GradeStructure, SupportedGradeType } from '@prisma/client';
import { Stream } from 'stream';
import ExcelJS from 'exceljs';
import BPromise from 'bluebird';
import { PrismaService } from 'utils/prisma';
import { BadRequestException } from 'utils/errors/domain.error';
import fs from 'fs';
import { flatMap, flatten, groupBy, isEmpty } from 'lodash';
import {
  CreateGradeStructureDto,
  GradeStructureFilterByCourseIdDto,
  GradeStructureFilterDto,
  UpdateGradeStructureDto,
} from '../resources/dto';
import { Injectable } from '@nestjs/common';
import { GradeBoardHeader, GradeBoardResponse } from '../resources/response';

export const IGradeStructureService = 'IGradeStructureService';
export interface IGradeStructureService {
  getGradeStructure(
    options: GradeStructureFilterByCourseIdDto,
  ): Promise<GradeStructure>;
  getGradeStructureDetail(
    gradeStructureId: string,
    options: GradeStructureFilterDto,
  ): Promise<GradeStructure>;
  createGradeStructure(
    createGradeStructure: CreateGradeStructureDto,
  ): Promise<GradeStructure>;
  updateGradeStructure(
    gradeStructureId: string,
    updateGradeStructureDto: UpdateGradeStructureDto,
  ): Promise<GradeStructure>;
  deleteGradeStructure(gradeStructureId: string): Promise<void>;
  downloadGradeBoard(gradeStructureId: string): Promise<GradeBoardResponse>;
}

@Injectable()
export class GradeStructureService implements IGradeStructureService {
  constructor(private readonly _prismaService: PrismaService) {}

  async downloadGradeBoard(
    gradeStructureId: string,
  ): Promise<GradeBoardResponse> {
    const gradeStructure = await this._prismaService.gradeStructure.findUnique({
      where: {
        id: gradeStructureId,
      },
      include: {
        gradeTypes: {
          where: {
            type: SupportedGradeType.PARENT,
          },
        },
      },
    });

    if (!gradeStructure) {
      throw new BadRequestException('Not found grade structure');
    }

    const stream = new Stream.PassThrough();
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream,
    });

    const worksheet = workbook.addWorksheet('grade_board');

    // write header
    const gradeTypes = await BPromise.map(
      gradeStructure.gradeTypes,
      async (gradeType) => {
        return this._prismaService.gradeType.findUnique({
          where: {
            id: gradeType.id,
          },
          select: {
            id: true,
            percentage: true,
            label: true,
            userCourseGrades: {
              select: {
                point: true,
                studentId: true,
              },
            },
            gradeSubTypes: {
              select: {
                id: true,
                percentage: true,
                label: true,
                userCourseGrades: {
                  select: {
                    point: true,
                    studentId: true,
                  },
                },
              },
            },
          },
        });
      },
    );

    let startRowContent = 1;
    const extractHeader = ({ label, percentage, gradeSubTypes, id }) => {
      const name = `${label} (${percentage}%)`;
      if (!isEmpty(gradeSubTypes)) {
        startRowContent = 2;
      }
      return {
        name,
        id,
        width: name.length < 20 ? 20 : name.length,
        subHeaders: gradeSubTypes?.map(extractHeader) || null,
      };
    };

    const gradeTypeHeaders = gradeTypes.map(extractHeader);
    const headers: GradeBoardHeader[] = [
      { name: 'StudentId', width: 20, id: 'StudentId' },
      ...gradeTypeHeaders,
      { name: 'Finalize', width: 20, id: 'Finalize' },
    ];

    console.log('headers', headers);

    const workSheetHeaderFirstRow = worksheet.getRow(1);
    const workSheetHeaderSecondRow = worksheet.getRow(2);
    let headerColumn = 1;

    headers.forEach((header) => {
      workSheetHeaderFirstRow.getCell(headerColumn).value = header.name;
      if (!isEmpty(header.subHeaders)) {
        header.subHeaders.forEach((header, index) => {
          worksheet.getColumn(headerColumn + index).key = header.id;
          workSheetHeaderSecondRow.getCell(headerColumn + index).value =
            header.name;
        });

        worksheet.mergeCells(
          1,
          headerColumn,
          1,
          headerColumn + header.subHeaders.length - 1,
        );
        headerColumn += header.subHeaders.length - 1;
      } else {
        worksheet.getColumn(headerColumn).key = header.id;
      }
      headerColumn++;
    });

    workSheetHeaderFirstRow.commit();
    // workSheetHeaderSecondRow.commit();

    // write data
    const filerDataForGroupByHandler = ({
      gradeSubTypes,
      userCourseGrades,
      percentage,
      id,
    }) => {
      if (isEmpty(gradeSubTypes)) {
        return userCourseGrades.map((data) => ({ ...data, percentage, id }));
      }

      return flatten<any>(gradeSubTypes.map(filerDataForGroupByHandler)).map(
        (data) => ({
          ...data,
          percentage: (data.percentage * percentage) / 100,
        }),
      );
    };

    const filterData = groupBy(
      flatten(gradeTypes.map(filerDataForGroupByHandler)),
      'studentId',
    );

    console.log('filter data', filterData);
    // studentID: [{gradeTypeId:, point}]
    Object.entries(filterData).forEach(([studentId, gradePoints], index) => {
      const row = worksheet.getRow(startRowContent + index + 1);
      row.getCell('StudentId').value = studentId;
      const finalize = gradePoints.reduce(
        (value, { point, percentage, id }) => {
          row.getCell(id).value = point;
          return value + (point * percentage) / 100;
        },
        0,
      );

      row.getCell('Finalize').value = finalize;
    });

    // finalizes.map(
    //   (finalize, index) =>
    //     (worksheet
    //       .getRow(startRowContent + index + 1)
    //       .getCell(headerColumn - 1).value = finalize),
    // );

    worksheet.commit();
    workbook.commit();

    await fs.promises.writeFile(
      'D:\\SOURCE CODE\\Project\\graduation\\Backend\\webnc\\test.xlsx',
      stream,
    );
    return {
      buffer: stream,
      fileName: 'grade-board.xlsx',
      ext: 'xlsx',
    };
  }

  async getGradeStructure(
    options: GradeStructureFilterByCourseIdDto,
  ): Promise<GradeStructure> {
    const result = await this._prismaService.gradeStructure.findUnique({
      where: {
        courseId: options.courseId,
      },
      include: {
        gradeTypes: {
          where: {
            type: SupportedGradeType.PARENT,
          },
          skip: options.skip,
          take: options.take,
        },
      },
    });

    if (!result) {
      throw new BadRequestException(
        `Not found grade structure at course id ${options.courseId}`,
      );
    }

    return result;
  }

  async getGradeStructureDetail(
    gradeStructureId: string,
    options: GradeStructureFilterDto,
  ): Promise<GradeStructure> {
    const result = await this._prismaService.gradeStructure.findUnique({
      where: {
        id: gradeStructureId,
      },
      include: {
        gradeTypes: {
          where: {
            type: SupportedGradeType.PARENT,
          },
          skip: options.skip,
          take: options.take,
        },
      },
    });

    if (!result) {
      throw new BadRequestException(
        `Not found grade structure at id ${gradeStructureId}`,
      );
    }

    return result;
  }

  async createGradeStructure(
    createGradeStructure: CreateGradeStructureDto,
  ): Promise<GradeStructure> {
    const isExistGradeStructure =
      await this._prismaService.gradeStructure.findUnique({
        where: {
          courseId: createGradeStructure.courseId,
        },
      });

    if (isExistGradeStructure) {
      throw new BadRequestException(
        'structure has exist in course id ' + createGradeStructure.courseId,
      );
    }

    let result = null;
    if (
      !createGradeStructure.gradeTypes ||
      isEmpty(createGradeStructure.gradeTypes)
    ) {
      result = await this._prismaService.gradeStructure.create({
        data: {
          courseId: createGradeStructure.courseId,
          name: createGradeStructure.name,
          status: createGradeStructure.status,
        },
      });
    } else {
      result = await this._prismaService.gradeStructure.create({
        data: {
          courseId: createGradeStructure.courseId,
          name: createGradeStructure.name,
          status: createGradeStructure.status,
          gradeTypes: {
            createMany: {
              data: createGradeStructure.gradeTypes,
            },
          },
        },
        include: {
          gradeTypes: true,
        },
      });
    }

    return result;
  }

  async updateGradeStructure(
    gradeStructureId: string,
    updateGradeStructureDto: UpdateGradeStructureDto,
  ): Promise<GradeStructure> {
    const result = await this._prismaService.gradeStructure.update({
      where: {
        id: gradeStructureId,
      },
      data: {
        ...updateGradeStructureDto,
      },
    });

    return result;
  }

  async deleteGradeStructure(gradeStructureId: string): Promise<void> {
    await this._prismaService.gradeStructure.delete({
      where: {
        id: gradeStructureId,
      },
    });
  }
}