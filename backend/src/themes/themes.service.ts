import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';

@Injectable()
export class ThemesService {
  private supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL or Key is not defined');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async findByClassDiscipline(classDisciplineId: string) {
    const { data, error } = await this.supabase
      .from('themes')
      .select('theme_id, title, description, order')
      .eq('class_discipline_id', classDisciplineId)
      .order('order', { ascending: true });

    if (error) {
      console.error('Erro ao buscar temas:', error.message);
      throw new InternalServerErrorException('Erro ao buscar temas');
    }

    return {
      data: (data || []).map((t) => ({
        id: t.theme_id,
        title: t.title,
        description: t.description,
        order: t.order,
      }))
    };
  }

  async createTheme(dto: CreateThemeDto) {
    const { data, error } = await this.supabase
      .from('themes')
      .insert({
        title: dto.title,
        description: dto.description,
        class_discipline_id: dto.class_discipline_id,
        order: dto.order,
      })
      .select('theme_id, title, description')
      .single();

    if (error) {
      console.error('Erro ao criar tema:', error);
      if (error.message.includes('unique_order_per_class_discipline')) {
        throw new BadRequestException('Já existe um tema com essa ordem para essa disciplina.');
      }

      throw new InternalServerErrorException('Erro ao criar tema');
    }

    return {
      data: {
        id: data.theme_id,
        title: data.title,
        description: data.description,
        order: dto.order,
      },
    };
  }


  async updateTheme(id: string, dto: UpdateThemeDto) {
    const { data, error } = await this.supabase
      .from('themes')
      .update({
        title: dto.title,
        description: dto.description,
        class_discipline_id: dto.class_discipline_id,
      })
      .eq('theme_id', id)
      .select('theme_id, title, description')
      .single();

    if (error) {
      console.error('Erro ao atualizar tema:', error.message);
      throw new InternalServerErrorException('Erro ao atualizar tema');
    }

    return { data: { id: data.theme_id, title: data.title, description: data.description } };
  }

  async deleteTheme(id: string) {
    const { error } = await this.supabase
      .from('themes')
      .delete()
      .eq('theme_id', id);

    if (error) {
      console.error('Erro ao remover tema:', error.message);
      throw new InternalServerErrorException('Erro ao remover tema');
    }

    return { message: 'Tema removido com sucesso' };
  }
}
