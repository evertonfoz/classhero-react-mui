import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Post,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { SearchClassesDto } from './dto/search-classes.dto';
import { CreateClassDto } from './dto/create-class.dto';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) { }

  @Get("all")
  findAll(@Query() searchClassesDto: SearchClassesDto) {
    return this.classesService.getAll(searchClassesDto);
  }

  @Post()
  async create(@Body() body: CreateClassDto) {
    return await this.classesService.createClassWithLinks(body);
  }

  // @Post(':id/generate-code')
  // async generate(
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @Body('minutes') minutes: number,
  // ): Promise<any> {
  //   const expires = new Date(Date.now() + (minutes || 60) * 60000);
  //   return await this.service.generateCode(id, expires);
  // }

  // @Get(':id')
  // async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<{ data?: Class; message?: string }> {
  //   const found = await this.service.findOne(id);
  //   if (!found) return { message: 'Not found' };
  //   return { data: found };
  // }


  // @Put(':id')
  // async update(
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @Body() body: UpdateClassDto,
  // ): Promise<Class> {
  //   return await this.service.update(id, body);
  // }

  // @Delete(':id')
  // async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
  //   return await this.service.remove(id);
  // }
}
