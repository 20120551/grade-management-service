import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseArrayPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IGradeStructureService, IGradeTypeService } from '../services';
import {
  CreateGradeStructureDto,
  CreateGradeTypeDto,
  CreateSubGradeTypeDto,
  GradeStructureFilterByCourseIdDto,
  GradeStructureFilterDto,
  GradeTypeFilterDto,
  UpdateGradeStructureDto,
  UpdateGradeTypeDto,
} from '../resources/dto';
import { AuthenticatedGuard } from 'guards';

// @UseGuards(AuthenticatedGuard)
@Controller('/api/grade')
export class GradeStructureController {
  constructor(
    @Inject(IGradeStructureService)
    private readonly _gradeStructureService: IGradeStructureService,
    @Inject(IGradeTypeService)
    private readonly _gradeTypeService: IGradeTypeService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  getGradeStructureByCourseId(
    @Query() filterByCourseId: GradeStructureFilterByCourseIdDto,
  ) {
    return this._gradeStructureService.getGradeStructure(filterByCourseId);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  getGradeStructureDetail(
    @Query() filter: GradeStructureFilterDto,
    @Param('id') id: string,
  ) {
    return this._gradeStructureService.getGradeStructureDetail(id, filter);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  createGradeStructure(
    @Body() createGradeStructureDto: CreateGradeStructureDto,
  ) {
    return this._gradeStructureService.createGradeStructure(
      createGradeStructureDto,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Put('/:id')
  uplodateGradeStructure(
    @Param('id') id: string,
    @Body() updateGradeStructureDto: UpdateGradeStructureDto,
  ) {
    return this._gradeStructureService.updateGradeStructure(
      id,
      updateGradeStructureDto,
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:id')
  deleteGradeStructure(@Param('id') id: string) {
    return this._gradeStructureService.deleteGradeStructure(id);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id/board')
  downloadGradeBoard(@Param('id') id: string) {
    return this._gradeStructureService.downloadGradeBoard(id);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('/:id/type')
  addGradeType(
    @Param('id') id: string,
    @Body() createGradeTypeDto: CreateGradeTypeDto,
  ) {
    return this._gradeTypeService.createGradeType(id, createGradeTypeDto);
  }

  @HttpCode(HttpStatus.CREATED)
  @Put('/:id/type/batch')
  batchGradeTypes(
    @Param('id') id: string,
    @Body(new ParseArrayPipe({ items: CreateGradeTypeDto }))
    createGradeTypeDto: CreateGradeTypeDto[],
  ) {
    return this._gradeTypeService.batchGradeType(id, createGradeTypeDto);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/type/:id')
  getGradeTypeDetail(
    @Query() filter: GradeTypeFilterDto,
    @Param('id') id: string,
  ) {
    return this._gradeTypeService.getGradeType(id, filter);
  }

  @HttpCode(HttpStatus.OK)
  @Put('/type/:id')
  updateGradeType(
    @Param('id') id: string,
    @Body() updateGradeTypeDto: UpdateGradeTypeDto,
  ) {
    return this._gradeTypeService.updateGradeType(id, updateGradeTypeDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/type/:id')
  deleteGradeType(@Param('id') id: string) {
    return this._gradeTypeService.deleteGradeType(id);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('/type/:id/sub')
  addGradeSubType(
    @Param('id') id: string,
    @Body() createGradeTypeDto: CreateSubGradeTypeDto,
  ) {
    return this._gradeTypeService.addSubGradeType(id, createGradeTypeDto);
  }

  @HttpCode(HttpStatus.CREATED)
  @Put('/type/:id/sub/batch')
  batchGradeSubTypes(
    @Param('id') id: string,
    @Body(new ParseArrayPipe({ items: CreateSubGradeTypeDto }))
    createGradeTypeDto: CreateSubGradeTypeDto[],
  ) {
    return this._gradeTypeService.batchSubGradeType(id, createGradeTypeDto);
  }
}
