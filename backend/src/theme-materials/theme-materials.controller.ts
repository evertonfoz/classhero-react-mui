import {
  Controller, Get, Post, Put, Delete,
  Param, Body,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { ThemeMaterialsService } from './theme-materials.service';
import { CreateThemeMaterialDto } from './dto/create-theme-material.dto';
import { UpdateThemeMaterialDto } from './dto/update-theme-material.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UseInterceptors } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';


@Controller('theme-materials')
export class ThemeMaterialsController {
  constructor(private readonly service: ThemeMaterialsService) { }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(@Body() body: any, @UploadedFile() file?: Express.Multer.File) {
    console.log('Body recebido:', body);
    console.log('Arquivo recebido:', file?.originalname);

    // Transforma e valida
    const dto = plainToInstance(CreateThemeMaterialDto, body);
    try {
      await validateOrReject(dto, { whitelist: true, forbidNonWhitelisted: true });
    } catch (errors) {
      // Extrai mensagens
      const validationErrors = errors.map((e) => Object.values(e.constraints || {})).flat();
      console.error('Erro de validação:', validationErrors);
      throw new BadRequestException(validationErrors);
    }

    return this.service.create(dto, file);
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
