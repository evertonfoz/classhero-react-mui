import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
  MaxLength
} from 'class-validator';
import { Type } from 'class-transformer';

class DisciplineTeacherDto {
  @IsString()
  @IsNotEmpty()
  discipline_id: string;

  @IsEmail()
  @IsOptional()
  teacher_email?: string | null;
}

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @IsNumber()
  @Min(1900)
  year: number;

  @IsNumber()
  @Min(1)
  semester: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DisciplineTeacherDto)
  disciplines: DisciplineTeacherDto[];

  @IsArray()
  @IsEmail({}, { each: true })
  student_emails: string[];
}
