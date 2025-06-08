import { Controller, Get, Param, Query, Delete, Body, Post, Put, ParseUUIDPipe } from '@nestjs/common';
import { DisciplinesService } from './disciplines.service';
import { SearchDisciplinesDto } from './dto/search-disciplines.dto';
import { CreateDisciplineDto } from './dto/create-discipline.dto';
import { UpdateDisciplineDto } from './dto/update-discipline.dto';

@Controller('disciplines')
export class DisciplinesController {
    constructor(private readonly disciplinesService: DisciplinesService) { }

    @Get("all")
    findAll(@Query() searchDisciplinesDto: SearchDisciplinesDto) {
        return this.disciplinesService.getAll(searchDisciplinesDto);
    }

    @Get(':id')
    async findDisciplineById(@Param('id') id: string) {
        return this.disciplinesService.findById(id);
    }

    @Post()
    async createDiscipline(@Body() createDisciplineDto: CreateDisciplineDto) {
        return await this.disciplinesService.createDisciplineWithCourses(createDisciplineDto);
    }


    // @Post()
    // create(@Body() dto: CreateDisciplineDto) {
    //     return this.disciplinesService.create(dto);
    // }

    @Put(':id')
    async updateDiscipline(
        @Param('id', new ParseUUIDPipe()) discipline_id: string,
        @Body() updateDisciplineDto: UpdateDisciplineDto,
    ) {
        return await this.disciplinesService.updateDisciplineInfo(discipline_id, updateDisciplineDto);
    }


    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.disciplinesService.remove(id);
    }
}
