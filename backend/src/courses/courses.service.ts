import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateCourseDto } from './dto/create-course.dto';
import { SearchCoursesDto } from './dto/search-courses.dto';
import { ConfigService } from '@nestjs/config';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  private supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL or Key is not defined');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async create(createCourseDto: CreateCourseDto) {
    try {
      const { data, error } = await this.supabase
        .from('courses')
        .insert([createCourseDto])
        .select()
        .single(); // para garantir retorno único e consistente

      if (error) {
        if (error.message.includes('idx_courses_acronym')) {
          throw new BadRequestException('A sigla informada já está em uso.');
        }

        if (error.message.includes('idx_courses_name')) {
          throw new BadRequestException('O nome do curso já está em uso.');
        }

        throw error;
      }

      return data;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      console.error('Erro ao criar curso:', error.message);
      throw new InternalServerErrorException('Erro ao criar curso. Tente novamente mais tarde.');
    }
  }

  async getAll({ page, limit, search }: SearchCoursesDto) {
    const offset = (page - 1) * limit;

    try {
      let countQuery = this.supabase.from('courses').select('*', { count: 'exact', head: true });
      if (search) {
        countQuery = countQuery.or(`name.ilike.%${search}%,acronym.ilike.%${search}%`);
      }
      const { count, error: countError } = await countQuery;
      if (countError) throw countError;

      let dataQuery = this.supabase
        .from('courses')
        .select('course_id, name, acronym, status')
        .order('name', { ascending: true });;

      if (search) {
        dataQuery = dataQuery.or(`name.ilike.%${search}%,acronym.ilike.%${search}%`);
      }

      const { data: courses, error: fetchError } = await dataQuery
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1);

      if (fetchError) throw fetchError;

      return {
        data: courses ?? [],
        totalCourses: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
        currentPage: page,
        limit,
      };
    } catch (error) {
      console.error('Erro ao buscar cursos:', error.message);
      throw new InternalServerErrorException('Erro ao buscar cursos');
    }
  }

  async searchCourses(search?: string) {
    try {
      let query = this.supabase
        .from('courses')
        .select('course_id, name')
        .eq('status', 'active');

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data, error } = await query.order('name', { ascending: true });

      if (error) {
        console.error('Erro ao buscar cursos:', error.message);
        throw new InternalServerErrorException('Erro ao buscar cursos');
      }

      return data;
    } catch (err) {
      console.error('Erro no searchCourses:', err.message);
      throw new InternalServerErrorException('Erro interno ao buscar cursos');
    }
  }


  async deleteCourse(course_id: string) {
    // Verifica se o curso está vinculado a alguma disciplina
    const { count, error: countError } = await this.supabase
      .from('courses_disciplines')
      .select('course_id', { count: 'exact', head: true })
      .eq('course_id', course_id);

    if (countError) {
      console.error('Erro ao verificar vínculos do curso:', countError.message);
      throw new InternalServerErrorException('Erro ao verificar vínculos do curso.');
    }

    // 🚫 Impede exclusão se houver vínculo
    if (typeof count === 'number' && count > 0) {
      throw new BadRequestException('Este curso está vinculado a uma ou mais disciplinas e não pode ser excluído.');
    }

    // ✅ Executa a exclusão
    const { error } = await this.supabase
      .from('courses')
      .delete()
      .eq('course_id', course_id);

    if (error) {
      console.error('Erro ao excluir o curso:', error.message);
      throw new InternalServerErrorException('Erro ao excluir o curso.');
    }

    return { message: 'Curso excluído com sucesso.' };
  }


  async findById(courseId: string) {
    try {
      const { data, error } = await this.supabase
        .from('courses')
        .select(`
        course_id,
        name,
        acronym,
        status
      `)
        .eq('course_id', courseId)
        .single();

      if (error) {
        console.error('Erro ao buscar curso por ID:', error.message);
        throw new InternalServerErrorException('Curso não encontrado ou erro na busca');
      }

      return { data };
    } catch (err) {
      console.error('Erro no findById:', err.message);
      throw new InternalServerErrorException('Erro interno ao buscar curso');
    }
  }

  async updateCourseInfo(course_id: string, updates: UpdateCourseDto) {
    try {
      const updateData: UpdateCourseDto = { ...updates };

      // Força campo is_active para false se não estiver definido
      if (typeof updateData.status === 'undefined') {
        updateData.status = 'inactive';
      }

      const { error } = await this.supabase
        .from('courses')
        .update(updateData)
        .eq('course_id', course_id);

      if (error) {
        console.error('Erro ao atualizar dados do curso:', error.message);
        throw new InternalServerErrorException('Erro ao atualizar dados do curso');
      }

      return { message: 'Curso atualizado com sucesso' };
    } catch (err) {
      console.error('Erro no updateCourseInfo:', err.message);
      throw new InternalServerErrorException('Erro ao atualizar informações do curso');
    }
  }

}
