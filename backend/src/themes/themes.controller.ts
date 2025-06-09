import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ThemesService } from './themes.service';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';

@Controller('themes')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Get('by-class-discipline/:id')
  findByClassDiscipline(@Param('id') id: string) {
    return this.themesService.findByClassDiscipline(id);
  }

  @Post()
  create(@Body() dto: CreateThemeDto) {
    return this.themesService.createTheme(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateThemeDto) {
    console.log('Atualizando tema:', id, dto);
    return this.themesService.updateTheme(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.themesService.deleteTheme(id);
  }
}
