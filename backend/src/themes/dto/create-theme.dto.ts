import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateThemeDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  class_discipline_id: string;

  @IsNotEmpty()
  @IsNumber()
  order: number;
}
