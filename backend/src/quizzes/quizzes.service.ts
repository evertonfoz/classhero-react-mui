// quizzes.service.ts

import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QuizzesService {
  private supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL or Key is not defined');
    }
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async findAllByMaterialId(
    material_id: string,
    page = 1,
    limit = 10,
    search = '',
    status?: string,
    type?: string,
    level?: string, // <- ADICIONADO
  ) {
    let query = this.supabase
      .from('quiz_questions')
      .select('*', { count: 'exact' })
      .eq('material_id', material_id);

    // Filtro por busca textual
    if (search) {
      query = query.ilike('question', `%${search}%`);
    }
    // Filtro por status
    if (status) {
      query = query.eq('status', status);
    }
    // Filtro por tipo
    if (type) {
      query = query.eq('type', type);
    }
    // Filtro por nível
    if (level) {
      query = query.eq('level', level);
    }

    // Paginação
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await query.range(from, to);

    if (error) {
      console.error('Erro ao buscar questões do quiz:', error.message);
      throw new InternalServerErrorException('Erro ao buscar questões do quiz');
    }

    return {
      data: data ?? [],
      totalPages: Math.ceil((count ?? 0) / limit) || 1,
    };
  }

  async findOneById(questionId: string) {
    const { data, error } = await this.supabase
      .from('quiz_questions')
      .select('*')
      .eq('question_id', questionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found (PostgREST code)
        throw new NotFoundException('Questão não encontrada');
      }
      console.error('Erro ao buscar questão:', error.message);
      throw new InternalServerErrorException('Erro ao buscar questão');
    }

    if (!data) {
      throw new NotFoundException('Questão não encontrada');
    }

    return data;
  }
}
