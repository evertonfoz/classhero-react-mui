import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
    private supabase: SupabaseClient;

    constructor(private readonly configService: ConfigService, private readonly emailService: EmailService,) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase URL ou Key não configurados');
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async sendCode(email: string) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Remove códigos antigos
        await this.supabase.from('otps').delete().eq('email', email);

        // Insere novo código
        const { error } = await this.supabase.from('otps').insert({ email, otp_code: otp });

        if (error) {
            throw new InternalServerErrorException('Erro ao salvar o OTP no Supabase.');
        }

        await this.emailService.sendOtpEmail(email, otp);

        // Envio real de e-mail seria feito aqui
        console.log(`Código ENVIADO para ${email}: ${otp}`);

        return { message: 'Código enviado por e-mail!' };
    }

    async verifyCode(email: string, code: string) {
        const { data, error } = await this.supabase
            .from('otps')
            .select()
            .eq('email', email)
            .eq('otp_code', code)
            .maybeSingle();

        if (error || !data) {
            throw new UnauthorizedException('Código inválido.');
        }

        await this.supabase.from('otps').delete().eq('email', email);

        const { data: userId, error: userIdError } = await this.supabase.rpc('get_user_id_by_email', { email });
        if (userId) {
            const signInRes = await this.supabase.auth.signInWithPassword({
                email: email,
                password: email,
            });
            if (signInRes.error) {
                throw new UnauthorizedException('Erro ao fazer login.');
            }
            return {
                access_token: signInRes.data.session?.access_token,
                refresh_token: signInRes.data.session?.refresh_token,
            };
        } else {
            const signUpRes = await this.supabase.auth.signUp({
                email: email,
                password: email,
            });

            if (!signUpRes.data.session) {
                throw new UnauthorizedException('Erro ao registrar usuário.');
            }

            const { data: insertUserData, error: errorInsertData } = await this.supabase
                .from('users')
                .insert({ email });

            return {
                access_token: signUpRes.data.session.access_token,
                refresh_token: signUpRes.data.session.refresh_token,
            };
        }
    }
}
