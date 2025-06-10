import {
  Controller, Get, Post, Put, Delete,
  Param, Body
} from '@nestjs/common';
import { ThemeMaterialsService } from '../theme-materials.service';
import { CreateThemeMaterialDto } from './create-theme-material.dto';
import { UpdateThemeMaterialDto } from './update-theme-material.dto';

@Controller('theme-materials')
export class ThemeMaterialsController {
  constructor(private readonly service: ThemeMaterialsService) {}

  @Post()
  create(@Body() dto: CreateThemeMaterialDto) {
    return this.service.create(dto);
  }

  @Get('by-theme/:themeId')
  findAllByTheme(@Param('themeId') themeId: string) {
    return this.service.findAllByTheme(themeId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateThemeMaterialDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
