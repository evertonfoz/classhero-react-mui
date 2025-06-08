import { IsOptional, IsBooleanString, IsString } from 'class-validator';

export class SearchUserOptionsDto {
  @IsOptional()
  @IsBooleanString()
  is_a_student?: string;

  @IsOptional()
  @IsBooleanString()
  is_a_teacher?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
