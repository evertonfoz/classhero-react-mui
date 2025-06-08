import { IsOptional, IsString, IsBoolean, Length, IsIn } from 'class-validator';

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(2, 10)
  acronym?: string;
  
    @IsString()
    @IsIn(['active', 'inactive'])
    status: 'active' | 'inactive';
}
