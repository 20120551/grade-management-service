import ExcelJS from 'exceljs';
import BPromise from 'bluebird';
import { BadRequestException } from 'utils/errors/domain.error';
import {
  FilterDto,
  UploadFileDto,
  UpsertGradeStudentByGradeTypeDto,
  UpsertGradeStudentDto,
} from '../resources/dto';
import {
  BatchResponse,
  StudentGradeResponse,
  StudentGradeTemplateResponse,
} from '../resources/response';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'utils/prisma';
import { Stream } from 'stream';
import {
  GradeReview,
  GradeReviewStatus,
  GradeStatus,
  PrismaClient,
  StudentCard,
  UserCourseGrade,
} from '@prisma/client';
import { differenceBy, isEmpty } from 'lodash';
import { streamToBuffer } from 'utils/file';

export const IGradeStudentService = 'IGradeStudentService';
export interface IGradeStudentService {
  getGradeTypeGrade(
    gradeTypeId: string,
    filterDto: FilterDto,
  ): Promise<StudentGradeResponse[]>;
  getStudentGradeInGradeType(
    userId: string,
    gradeTypeId: string,
  ): Promise<StudentGradeResponse>;
  addCourseGrade(
    courseId: string,
    gradeTypeId: string,
    upsertGradeStudentDto: UpsertGradeStudentDto,
  ): Promise<StudentGradeResponse>;
  updateCourseGrade(
    gradeTypeId: string,
    upsertGradeStudentDto: UpsertGradeStudentDto,
  ): Promise<StudentGradeResponse>;
  batchCourseGradeForStudent(
    courseId: string,
    studentId: string,
    data: UpsertGradeStudentByGradeTypeDto[],
  ): Promise<UserCourseGrade[]>;
  deleteCourseGrade(studentId: string, gradeTypeId: string): Promise<void>;
  batchCourseGrade(
    courseId: string,
    gradeTypeId: string,
    gradeTemplate: UploadFileDto,
  ): Promise<BatchResponse>;
  downloadGradeTemplate(
    gradeTypeId: string,
  ): Promise<StudentGradeTemplateResponse>;
}

@Injectable()
export class GradeStudentService implements IGradeStudentService {
  constructor(
    private readonly _prisma: PrismaClient,
    private readonly _prismaService: PrismaService,
  ) {}

  async batchCourseGradeForStudent(
    courseId: string,
    studentId: string,
    data: UpsertGradeStudentByGradeTypeDto[],
  ): Promise<UserCourseGrade[]> {
    const filterdData = data.filter(
      (grade) => grade.point === 0 || grade.point,
    );
    if (isEmpty(filterdData)) {
      return [];
    }

    const student = await this._prismaService.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        students: true,
      },
    });

    if (
      JSON.parse(student.students.toString()).every(
        (student) => student.studentId !== studentId,
      )
    ) {
      throw new BadRequestException('student does not appear in course');
    }

    const res = await this._prisma.$transaction(async (context) => {
      const res = await BPromise.map(filterdData, async (upsertData) => {
        const res = await context.userCourseGrade.upsert({
          where: {
            gradeTypeId_studentId: {
              gradeTypeId: upsertData.gradeTypeId,
              studentId: studentId,
            },
          },
          create: {
            point: upsertData.point,
            studentId,
            gradeTypeId: upsertData.gradeTypeId,
            courseId,
          },
          update: {
            point: upsertData.point,
          },
        });

        return res;
      });

      return res;
    });

    return res;
  }

  async getGradeTypeGrade(
    gradeTypeId: string,
    filterDto: FilterDto,
  ): Promise<StudentGradeResponse[]> {
    const userCourseGrade = await this._prismaService.userCourseGrade.findMany({
      where: {
        gradeTypeId,
      },
      take: filterDto.take,
      skip: filterDto.skip,
      select: {
        studentId: true,
        point: true,
        gradeReviews: {
          select: {
            status: true,
          },
        },
      },
    });

    const res = userCourseGrade.map(({ gradeReviews, ...payload }) => ({
      ...payload,
      status: this._getGradeReviewStatus(gradeReviews),
    }));
    return res;
  }

  async getStudentGradeInGradeType(
    userId: string,
    gradeTypeId: string,
  ): Promise<StudentGradeResponse> {
    const gradeType = await this._prismaService.gradeType.findUnique({
      where: {
        id: gradeTypeId,
      },
      select: {
        status: true,
        gradeSubTypes: {
          select: {
            id: true,
            percentage: true,
            label: true,
          },
        },
      },
    });

    if (gradeType.status !== GradeStatus.DONE) {
      throw new BadRequestException(
        'Please, wait for this grade type mark as finalize',
      );
    }

    // case: 1
    const user = await this._prismaService.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        studentCard: {
          select: {
            studentId: true,
          },
        },
      },
    });

    if (!user || !user.studentCard?.studentId) {
      throw new BadRequestException(
        'cannot have permission to see that resource',
      );
    }

    let userCourseGrade = null;
    userCourseGrade = await this._prismaService.userCourseGrade.findFirst({
      where: {
        studentId: user.studentCard.studentId,
        gradeTypeId,
      },
      select: {
        point: true,
        gradeReviews: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!userCourseGrade) {
      throw new BadRequestException('not found grade with student id');
    }

    if (!isEmpty(gradeType.gradeSubTypes)) {
      const points = await BPromise.map(
        gradeType.gradeSubTypes,
        async (gradeType) => {
          const data = await this._prismaService.userCourseGrade.findFirst({
            where: {
              studentId: user.studentCard.studentId,
              gradeTypeId: gradeType.id,
            },
            select: {
              point: true,
            },
          });

          return {
            point: data.point,
          };
        },
      );

      userCourseGrade.point = points.reduce(
        (val, point) => point.point + val,
        0,
      );
    }

    console.log(userCourseGrade);
    return {
      point: userCourseGrade.point,
      studentId: user.studentCard.studentId,
      status: this._getGradeReviewStatus(userCourseGrade.gradeReviews),
    };
  }

  async addCourseGrade(
    courseId: string,
    gradeTypeId: string,
    upsertGradeStudentDto: UpsertGradeStudentDto,
  ): Promise<StudentGradeResponse> {
    const result = await this._prismaService.userCourseGrade.create({
      data: {
        gradeTypeId,
        courseId,
        studentId: upsertGradeStudentDto.studentId,
        point: upsertGradeStudentDto.point,
      },
    });

    return result;
  }

  async updateCourseGrade(
    gradeTypeId: string,
    upsertGradeStudentDto: UpsertGradeStudentDto,
  ): Promise<StudentGradeResponse> {
    const userGrade = await this._prismaService.userCourseGrade.update({
      where: {
        gradeTypeId_studentId: {
          gradeTypeId,
          studentId: upsertGradeStudentDto.studentId,
        },
      },
      data: {
        point: upsertGradeStudentDto.point,
      },
    });

    return userGrade;
  }

  async deleteCourseGrade(
    studentId: string,
    gradeTypeId: string,
  ): Promise<void> {
    await this._prismaService.userCourseGrade.delete({
      where: {
        gradeTypeId_studentId: {
          gradeTypeId,
          studentId,
        },
      },
    });
  }

  async batchCourseGrade(
    courseId: string,
    gradeTypeId: string,
    gradeTemplate: UploadFileDto,
  ): Promise<BatchResponse> {
    const stream = Stream.Readable.from(gradeTemplate.buffer);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.read(stream);

    const worksheet = workbook.getWorksheet(1);
    const headers = worksheet.getRow(1);

    if (
      headers.getCell(1).value !== 'StudentId' ||
      headers.getCell(2).value !== 'Grade'
    ) {
      throw new BadRequestException('not support this template');
    }

    const studentGrade = [];
    worksheet.eachRow((row) => {
      const studentId = row.getCell(1).value.toString();
      const grade = row.getCell(2).value;
      if (studentId.match(/([A-Za-z_\\-\\.])+/i)) {
        return;
      }

      studentGrade.push({
        studentId,
        grade,
      });
    });

    const userCourseGrade = await this._prismaService.userCourseGrade.findMany({
      where: {
        gradeTypeId,
      },
      select: {
        studentId: true,
      },
    });

    const create = differenceBy(studentGrade, userCourseGrade, 'studentId');
    const update = studentGrade.filter(
      (student) =>
        !create.some((create) => create.studentId === student.studentId),
    );

    const result = await this._prisma.$transaction(
      async (context) => {
        const result = await context.userCourseGrade.createMany({
          data: create.map((data) => ({
            courseId,
            studentId: data.studentId,
            point: data.grade,
            gradeTypeId,
          })),
        });

        await BPromise.mapSeries(update, async (data) => {
          await context.userCourseGrade.update({
            where: {
              gradeTypeId_studentId: {
                gradeTypeId: gradeTypeId,
                studentId: data.studentId,
              },
            },
            data: {
              point: data.grade,
            },
          });
        });

        return result;
      },
      {
        timeout: 10000,
      },
    );

    return result;
  }

  async downloadGradeTemplate(
    gradeTypeId: string,
  ): Promise<StudentGradeTemplateResponse> {
    const gradeType = await this._prismaService.gradeType.findUnique({
      where: {
        id: gradeTypeId,
      },
      include: {
        gradeStructure: {
          select: {
            course: {
              select: {
                students: true,
              },
            },
          },
        },
      },
    });

    if (!gradeType) {
      throw new BadRequestException('not found grade type');
    }

    const stream = new Stream.PassThrough();
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream,
    });

    const worksheet = workbook.addWorksheet('grade');
    // HEADER
    const headers = [
      {
        name: 'StudentId',
        width: 20,
      },
      {
        name: 'Grade',
        width: 20,
      },
    ];

    worksheet.addRow(headers.map((header) => header.name));
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.alignment = {
        vertical: 'top',
        wrapText: true,
      };
      cell.font = {
        size: 11,
        bold: true,
      };
    });

    headerRow.commit();

    // add data
    const students = JSON.parse(
      gradeType.gradeStructure.course.students.toString(),
    ) as StudentCard[];

    students.forEach((student, index) => {
      const cell = worksheet.getRow(index + 2).getCell(1);
      cell.value = student.studentId;
    });

    worksheet.commit();
    workbook.commit();

    return {
      buffer: await streamToBuffer(stream),
      ext: 'xlsx',
      fileName: 'import-grade.xlsx',
    };
  }

  private _getGradeReviewStatus(gradeReviews: { status: string }[]): string {
    if (isEmpty(gradeReviews)) {
      return 'NOREVIEWS';
    }

    if (gradeReviews.every(({ status }) => status === 'DONE')) {
      return 'DONE';
    }

    return 'REQUEST';
  }
}
