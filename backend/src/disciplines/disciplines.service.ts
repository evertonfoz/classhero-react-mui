import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SearchDisciplinesDto } from './dto/search-disciplines.dto';
import { ConfigService } from '@nestjs/config';
import { CreateDisciplineDto } from './dto/create-discipline.dto';
import { UpdateDisciplineDto } from './dto/update-discipline.dto';

@Injectable()
export class DisciplinesService {
    private supabase: SupabaseClient;

    constructor(private readonly configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase URL or Key is not defined');
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async getAll({ page, limit, search }: SearchDisciplinesDto) {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = this.supabase
            .from('disciplines')
            .select('*', { count: 'exact' })
            .order('name', { ascending: true })
            .range(from, to);

        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        const { data, count, error } = await query;

        if (error) throw new Error(error.message);

        return {
            data,
            totalPages: Math.ceil((count || 0) / limit),
        };
    }



    async findById(disciplineId: string) {
  try {
    const { data, error } = await this.supabase
      .from('disciplines')
      .select(`
        discipline_id,
        name,
        syllabus,
        workload_hours,
        courses_disciplines (
          course: courses (
            course_id,
            name
          )
        )
      `)
      .eq('discipline_id', disciplineId)
      .single();

    if (error) {
      console.error('Erro ao buscar disciplina por ID:', error.message);
      throw new InternalServerErrorException('Disciplina não encontrada ou erro na busca');
    }

    // 🔄 Normaliza os cursos para o formato esperado no frontend
    const courses = (data.courses_disciplines || []).map((cd: any) => cd.course);

    return { data: { ...data, courses } };
  } catch (err) {
    console.error('Erro no findById:', err.message);
    throw new InternalServerErrorException('Erro interno ao buscar disciplina');
  }
}


    // async create(dto: CreateDisciplineDto) {
    //     const { data, error } = await this.supabase
    //         .from('disciplines')
    //         .insert([{ ...dto }])
    //         .select()
    //         .single();

    //     if (error) {
    //         if (error.code === '23505') {
    //             throw new Error('Já existe uma disciplina com esse nome.');
    //         }
    //         throw new Error(error.message);
    //     }

    //     return { message: 'Disciplina cadastrada com sucesso', data };
    // }
    async createDisciplineWithCourses(dto: CreateDisciplineDto) {
        try {
            const { course_ids, ...disciplineData } = dto;

            const { data, error: insertError } = await this.supabase
                .from('disciplines')
                .insert(disciplineData)
                .select('discipline_id')
                .single();

            if (insertError) {
                console.error('Erro ao criar disciplina:', insertError.message);
                throw new InternalServerErrorException('Erro ao criar disciplina');
            }

            if (course_ids && course_ids.length > 0) {
                const courseDisciplineEntries = course_ids.map((course_id) => ({
                    course_id,
                    discipline_id: data.discipline_id,
                }));

                const { error: linkError } = await this.supabase
                    .from('courses_disciplines')
                    .insert(courseDisciplineEntries);

                if (linkError) {
                    console.error('Erro ao associar cursos:', linkError.message);
                    throw new InternalServerErrorException('Erro ao associar cursos à disciplina');
                }
            }

            return { message: 'Disciplina criada com sucesso', discipline_id: data.discipline_id };
        } catch (err) {
            console.error('Erro no createDisciplineWithCourses:', err.message);
            throw new InternalServerErrorException('Erro ao criar disciplina');
        }
    }


    async updateDisciplineInfo(discipline_id: string, updates: UpdateDisciplineDto) {
        try {
            const updateData: UpdateDisciplineDto = { ...updates };
            const { course_ids, ...rest } = updateData;

            const { error: updateError } = await this.supabase
                .from('disciplines')
                .update(rest)
                .eq('discipline_id', discipline_id);

            if (updateError) {
                console.error('Erro ao atualizar dados da disciplina:', updateError.message);
                throw new InternalServerErrorException('Erro ao atualizar dados da disciplina');
            }

            if (course_ids) {
                // Remove associações antigas
                const { error: deleteError } = await this.supabase
                    .from('courses_disciplines')
                    .delete()
                    .eq('discipline_id', discipline_id);

                if (deleteError) {
                    console.error('Erro ao remover associações antigas:', deleteError.message);
                    throw new InternalServerErrorException('Erro ao atualizar cursos vinculados');
                }

                // Adiciona novas associações
                const newAssociations = course_ids.map((course_id) => ({
                    course_id,
                    discipline_id,
                }));

                const { error: insertError } = await this.supabase
                    .from('courses_disciplines')
                    .insert(newAssociations);

                if (insertError) {
                    console.error('Erro ao inserir novas associações:', insertError.message);
                    throw new InternalServerErrorException('Erro ao vincular cursos à disciplina');
                }
            }

            return { message: 'Disciplina atualizada com sucesso' };
        } catch (err) {
            console.error('Erro no updateDisciplineInfo:', err.message);
            throw new InternalServerErrorException('Erro ao atualizar informações da disciplina');
        }
    }



    async remove(id: string) {
        const { error } = await this.supabase
            .from('disciplines')
            .delete()
            .eq('discipline_id', id);

        if (error) throw new Error(error.message);

        return { message: 'Disciplina removida com sucesso' };
    }
}
