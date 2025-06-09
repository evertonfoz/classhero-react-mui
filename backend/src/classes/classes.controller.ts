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
import { UpdateClassDto } from './dto/update-class-dto';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) { }

  @Get("all")
  findAll(@Query() searchClassesDto: SearchClassesDto) {
    return this.classesService.getAll(searchClassesDto);
  }

  @Get(':id')
  async findOne(@Param('id') class_id: string) {
    return this.classesService.findClassById(class_id);
  }


  @Post()
  async create(@Body() body: CreateClassDto) {
    return await this.classesService.createClassWithLinks(body);
  }

  @Put(':id')
  async update(
    @Param('id') class_id: string,
    @Body() body: UpdateClassDto,
  ) {
    return this.classesService.updateClass(class_id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.classesService.delete(id);
  }


  // @Post(':id/generate-code')
  // async generate(
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @Body('minutes') minutes: number,
  // ): Promise<any> {
  //   const expires = new Date(Date.now() + (minutes || 60) * 60000);
  //   return await this.service.generateCode(id, expires);
  // }
}
