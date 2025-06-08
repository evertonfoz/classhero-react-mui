// src/users/users.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SearchUsersDto } from './dto/search-users.dto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { UpdateUserInfoDto } from './dto/update-user-info.dto';

@Injectable()
export class UsersService {
    private supabase: SupabaseClient;

    constructor(private readonly configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase URL ou Key não configurados');
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async getAllUsers({
        page,
        limit,
        search,
        is_a_admin,
        is_a_teacher,
        is_a_student,
        is_validated,
    }: SearchUsersDto) {
        const offset = (page - 1) * limit;

        try {
            const filters: Record<string, boolean> = {};
            if (is_a_admin !== undefined) filters.is_a_admin = is_a_admin;
            if (is_a_teacher !== undefined) filters.is_a_teacher = is_a_teacher;
            if (is_a_student !== undefined) filters.is_a_student = is_a_student;
            if (is_validated !== undefined) filters.is_validated = is_validated;

            const filterKeys = Object.keys(filters);
            const hasFilter = filterKeys.length > 0;

            // --- COUNT QUERY ---
            let countQuery = this.supabase
                .from('users')
                .select('*', { count: 'exact', head: true });

            if (search) {
                countQuery = countQuery.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
            }

            if (hasFilter) {
                countQuery = countQuery.match(filters);
            }

            const { count, error: countError } = await countQuery;
            if (countError) throw countError;

            // --- DATA QUERY (AGORA COM AVATAR) ---
            let dataQuery = this.supabase
                .from('users')
                .select(`
  name,
  email,
  is_a_admin,
  is_a_teacher,
  is_a_student,
  is_validated,
  users_avatars (
    avatar_url,
    is_active
  )
`)

                .order('name', { ascending: true });

            if (search) {
                dataQuery = dataQuery.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
            }

            if (hasFilter) {
                dataQuery = dataQuery.match(filters);
            }

            const { data: users, error: fetchError } = await dataQuery.range(offset, offset + limit - 1);

            if (fetchError) throw fetchError;

            return {
                data: users ?? [],
                totalUsers: count ?? 0,
                totalPages: Math.ceil((count ?? 0) / limit),
                currentPage: page,
                limit,
            };
        } catch (error) {
            console.error('Erro no getAllUsers:', error.message);
            throw new InternalServerErrorException('Erro ao buscar usuários');
        }
    }



    async findByEmail(email: string) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select(`
                    name,
                    email,
                    is_a_admin,
                    is_a_teacher,
                    is_a_student,
                    is_validated,
                    users_avatars (
                        avatar_url,
                        is_active
                    )
                `)
                .eq('email', email)
                .single();

            if (error) {
                console.error('Erro ao buscar usuário por e-mail:', error.message);
                throw new InternalServerErrorException('Usuário não encontrado ou erro na busca');
            }

            return {
                data
            };
        } catch (err) {
            console.error('Erro no findByEmail:', err.message);
            throw new InternalServerErrorException('Erro interno ao buscar usuário');
        }
    }

    async uploadAvatar(file: Express.Multer.File, email: string) {
        try {
            const filename = `${uuidv4()}_${file.originalname}`;
            const bucket = 'classhero_bucket';

            const { error: uploadError } = await this.supabase.storage
                .from(bucket)
                .upload(`users/avatars/${filename}`, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false,
                });

            if (uploadError) {
                console.error('Erro no upload:', uploadError.message);
                throw new InternalServerErrorException('Falha ao subir avatar');
            }

            const { data: publicUrlData } = this.supabase.storage
                .from(bucket)
                .getPublicUrl(`users/avatars/${filename}`);

            const avatarUrl = publicUrlData.publicUrl;

            await this.supabase
                .from('users_avatars')
                .update({ is_active: false })
                .eq('email', email);

            const { error: insertError } = await this.supabase
                .from('users_avatars')
                .insert({
                    email,
                    avatar_url: avatarUrl,
                    is_active: true,
                });

            await this.supabase
                .from('users')
                .update({ is_validated: false })
                .eq('email', email);

            await this.notifyAdminOfProfileUpdate(email);

            if (insertError) {
                console.error('Erro ao salvar na tabela users_avatars:', insertError.message);
                throw new InternalServerErrorException('Erro ao registrar avatar');
            }

            return { message: 'Avatar atualizado com sucesso', avatar_url: avatarUrl };
        } catch (error) {
            console.error('Erro no uploadAvatar:', error.message);
            throw new InternalServerErrorException('Erro ao enviar avatar');
        }
    }

    private async notifyAdminOfProfileUpdate(email: string, changes?: Record<string, any>) {
        const subject = `CLASSHERO - Usuário ${email} alterou cadastro`;

        let changeHtml = '';
        if (changes) {
            const lines = Object.entries(changes).map(([key, value]) =>
                `<li><strong>${key}</strong>: ${String(value)}</li>`
            ).join('');
            changeHtml = `<ul style="text-align: left;">${lines}</ul>`;
        }

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; 
                margin: auto; padding: 20px; border: 1px solid #dddddd; 
                border-radius: 8px;">
                <h2 style="color: #333333; text-align: center;">
                Usuário alterou cadastro</h2>

                <p style="color: #555555; font-size: 16px; text-align: center;">
                O usuário com o email a seguir alterou seu cadastro:</p>

                <div style="margin: 30px auto; text-align: center; background-color: #f4f4f4; padding: 15px; border-radius: 8px; width: fit-content;">
                <span style="font-size: 24px; font-weight: bold; color: #333333; letter-spacing: 4px;">
                    ${email}
                </span>
                </div>

                ${changeHtml ? `<h4>Campos alterados:</h4>${changeHtml}` : ''}

                <p style="color: #555555; font-size: 14px; text-align: center;">
                Acesse e avalie a alteração.</p>

                <p style="color: #888888; font-size: 12px; text-align: center; margin-top: 40px;">
                &copy; CLASSHERO | Todos os direitos reservados.
                </p>
            </div>
            `;

        try {
            const response = await fetch('https://bnzkmlbanebwrdwvtccj.supabase.co/functions/v1/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: 'evertoncoimbra@gmail.com',
                    subject,
                    html,
                }),
            });

            if (!response.ok) {
                const msg = await response.text();
                throw new Error(`Erro ao enviar e-mail: ${response.status} - ${msg}`);
            }
        } catch (err) {
            console.error('Erro ao notificar administrador:', err);
            throw new InternalServerErrorException('Erro ao notificar administrador');
        }
    }

    async updateUserInfo(email: string, updates: UpdateUserInfoDto) {
        try {
            // Garante que não desative conta de admin
            const isAdmin = updates.is_a_admin === true;

            const updateData: UpdateUserInfoDto = { ...updates };

            // Se não for admin e is_validated não veio no update, forçamos false
            if (!isAdmin && typeof updates.is_validated === 'undefined') {
                updateData.is_validated = false;
            }


            const { error } = await this.supabase
                .from('users')
                .update(updateData)
                .eq('email', email)

            if (error) {
                console.error('Erro ao atualizar dados do usuário:', error.message);
                throw new InternalServerErrorException('Erro ao atualizar dados do usuário');
            }

            if (!isAdmin) {
                await this.notifyAdminOfProfileUpdate(email, updateData);
            }

            return { message: 'Dados atualizados com sucesso' };
        } catch (err) {
            console.error('Erro no updateUserInfo:', err.message);
            throw new InternalServerErrorException('Erro ao atualizar informações do usuário');
        }
    }

    async deleteUserByEmail(email: string) {
        const { error } = await this.supabase.from('users').delete().eq('email', email);
        if (error) {
            console.error('Erro ao excluir usuário:', error.message);
            throw new InternalServerErrorException('Erro ao excluir usuário');
        }
        return { message: 'Usuário excluído com sucesso' };
    }

    async setAvatarByUrl(email: string, avatar_url: string) {
        try {
            // Desativa todos os avatares atuais do usuário
            const { error: deactivateError } = await this.supabase
                .from('users_avatars')
                .update({ is_active: false })
                .eq('email', email);

            if (deactivateError) {
                console.error('Erro ao desativar avatares antigos:', deactivateError.message);
                throw new InternalServerErrorException('Erro ao desativar avatares');
            }

            // Ativa a imagem selecionada
            const { error: activateError } = await this.supabase
                .from('users_avatars')
                .update({ is_active: true })
                .eq('email', email)
                .eq('avatar_url', avatar_url);

            if (activateError) {
                console.error('Erro ao ativar novo avatar:', activateError.message);
                throw new InternalServerErrorException('Erro ao ativar novo avatar');
            }

            // Marca como não validado novamente
            const { error: updateError } = await this.supabase
                .from('users')
                .update({ is_validated: false })
                .eq('email', email);

            if (updateError) {
                console.error('Erro ao marcar usuário como não validado:', updateError.message);
                throw new InternalServerErrorException('Erro ao atualizar validação');
            }

            await this.notifyAdminOfProfileUpdate(email, {
                avatar_url,
                is_validated: false,
            });

            return {
                message: 'Avatar antigo ativado com sucesso',
                user: { email, avatar_url, is_validated: false },
            };
        } catch (err) {
            console.error('Erro no setAvatarByUrl:', err.message);
            throw new InternalServerErrorException('Erro ao ativar avatar por URL');
        }
    }

}