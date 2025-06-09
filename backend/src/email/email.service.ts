// src/email/email.service.ts
import { Injectable } from '@nestjs/common';
import { registryConfirmationEmail } from './templates';

@Injectable()
export class EmailService {
  async sendOtpEmail(to_email: string, otp_code: string): Promise<void> {
    const subject = 'CLASSHERO - Código de Acesso';
    const html = registryConfirmationEmail(otp_code);

    const supabaseFunctionUrl =
      'https://bnzkmlbanebwrdwvtccj.supabase.co/functions/v1/send-email';

    const emailData = { to: to_email, subject, html };

    const response = await fetch(supabaseFunctionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Erro ao enviar e-mail: ${response.status} - ${errorBody}`);
    }
  }
}
