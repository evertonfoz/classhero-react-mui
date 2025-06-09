import { IsString, IsBoolean, IsNotEmpty, IsIn } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  acronym: string;

  @IsString()
  @IsIn(['active', 'inactive'])
  status: 'active' | 'inactive';

}
