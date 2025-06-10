import {
  Controller, Get, Post, Put, Delete,
  Param, Body,
  UploadedFile
} from '@nestjs/common';
import { ThemeMaterialsService } from './theme-materials.service';
import { CreateThemeMaterialDto } from './dto/create-theme-material.dto';
import { UpdateThemeMaterialDto } from './dto/update-theme-material.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UseInterceptors } from '@nestjs/common';


@Controller('theme-materials')
export class ThemeMaterialsController {
  constructor(private readonly service: ThemeMaterialsService) { }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(@Body() dto: CreateThemeMaterialDto, @UploadedFile() file?: Express.Multer.File) {
    return this.service.create(dto, file);
  }


  @Get('by-theme/:themeId')
  findAllByTheme(@Param('themeId') themeId: string) {
    console.log('Fetching materials for theme:', themeId);
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
