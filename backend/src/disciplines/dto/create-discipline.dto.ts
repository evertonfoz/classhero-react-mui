import { IsNotEmpty, IsOptional, IsString, IsNumber, Min, IsArray, IsUUID } from 'class-validator';

export class CreateDisciplineDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome da disciplina é obrigatório.' })
  name: string;

  @IsOptional()
  @IsString()
  syllabus?: string;

  @IsNumber()
  @Min(1, { message: 'A carga horária deve ser de pelo menos 1 hora.' })
  workload_hours: number;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true, message: 'IDs dos cursos devem ser UUIDs válidos.' })
  course_ids?: string[];
}
