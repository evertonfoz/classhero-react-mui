import { Controller, Get, Query } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';

@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  // GET /quizzes?material_id=xxxx
  @Get()
  async findAllByMaterialId(@Query('material_id') material_id: string) {
    if (!material_id) {
      return { error: 'O parâmetro material_id é obrigatório' };
    }
    return this.quizzesService.findAllByMaterialId(material_id);
  }
}
