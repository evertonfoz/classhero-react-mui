// quizzes.controller.ts

import { Controller, Get, Param, Query } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';

@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get()
  async findAll(
    @Query('material_id') materialId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search = '',
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('level') level?: string, // <- ADICIONADO
  ) {
    return this.quizzesService.findAllByMaterialId(
      materialId,
      Number(page),
      Number(limit),
      search,
      status,
      type,
      level, // <- ADICIONADO
    );
  }

   @Get(':questionId')
  async findOne(@Param('questionId') questionId: string) {
    return this.quizzesService.findOneById(questionId);
  }
}
