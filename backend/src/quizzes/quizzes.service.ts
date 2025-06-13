import { Injectable, InternalServerErrorException } from '@nestjs/common';
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

  // Busca todas as questões para um material
  async findAllByMaterialId(material_id: string) {
    console.log('🟡 [QuizService] Iniciando busca de questões do material:', material_id);
    try {
      const { data, error } = await this.supabase
        .from('quiz_questions')
        .select('*')
        .eq('material_id', material_id);

      if (error) {
        console.error('🔴 [QuizService] Erro Supabase ao buscar questões do quiz:', error.message, error.details || '');
        throw new InternalServerErrorException('Erro ao buscar questões do quiz');
      }

      console.log('🟢 [QuizService] Busca concluída. Total de questões encontradas:', Array.isArray(data) ? data.length : 0);
      // Para log detalhado das questões:
      // console.dir(data, { depth: null }); // descomente se quiser ver tudo

      return data || [];
    } catch (err) {
      console.error('🔴 [QuizService] Exceção inesperada:', err);
      throw new InternalServerErrorException('Erro inesperado ao buscar questões do quiz');
    }
  }
}
