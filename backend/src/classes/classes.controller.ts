import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ClassesService } from './classes.service';

@Controller('classes')
export class ClassesController {
  constructor(private readonly service: ClassesService) {}

  @Get('all')
  findAll() {
    return { data: this.service.findAll() };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const found = this.service.findOne(id);
    if (!found) return { message: 'Not found' };
    return { data: found };
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/generate-code')
  generate(@Param('id') id: string, @Body('minutes') minutes: number) {
    const expires = new Date(Date.now() + (minutes || 60) * 60000);
    return this.service.generateCode(id, expires);
  }
}
