import { Controller, Get, Post, Body, Query, Delete, Param, Put, ParseUUIDPipe } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { SearchCoursesDto } from './dto/search-courses.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) { }

  @Post()
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get("all")
  findAll(@Query() searchCoursesDto: SearchCoursesDto) {
    return this.coursesService.getAll(searchCoursesDto);
  }

  @Delete(':id')
  async deleteCourse(@Param('id') id: string) {
    return this.coursesService.deleteCourse(id);
  }

  @Get('search')
  async search(@Query('q') search?: string) {
    return await this.coursesService.searchCourses(search);
  }

  @Get(':id')
  async findCourseById(@Param('id') id: string) {
    return this.coursesService.findById(id);
  }

  @Put(':id')
  async updateCourse(
    @Param('id', new ParseUUIDPipe()) course_id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return await this.coursesService.updateCourseInfo(course_id, updateCourseDto);
  }
}
