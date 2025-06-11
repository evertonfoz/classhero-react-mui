import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateThemeDto {
  @IsNotEmpty({ message: 'Título é obrigatório.' })
  @IsString({ message: 'Título deve ser uma string.' })
  title: string;

  @IsNotEmpty({ message: 'Descrição é obrigatória.' })
  @IsString({ message: 'Descrição deve ser uma string.' })
  description: string;

  @IsNotEmpty({ message: 'A associação com a disciplina é obrigatória.' })
  @IsString({ message: 'O campo class_discipline_id deve ser uma string.' })
  class_discipline_id: string;

  @IsNotEmpty({ message: 'Ordem é obrigatória.' })
  @IsNumber({}, { message: 'Ordem deve ser um número.' })
  order: number;
}
