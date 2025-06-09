// dto/update-class.dto.ts
import { IsNotEmpty, IsString, IsNumber, IsArray, IsOptional } from 'class-validator';

export class UpdateClassDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsNumber()
  year: number;

  @IsNotEmpty()
  @IsNumber()
  semester: number;

  @IsArray()
  disciplines: {
    discipline_id: string;
    teacher_email: string | null;
  }[];

  @IsArray()
  student_emails: string[];
}
