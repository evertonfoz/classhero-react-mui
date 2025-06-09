// src/email/templates.ts

export function registryConfirmationEmail(code: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px;
      margin: auto; padding: 20px; border: 1px solid #dddddd; border-radius: 8px;">
      
      <h2 style="color: #333333; text-align: center;">Confirmação de Cadastro</h2>

      <p style="color: #555555; font-size: 16px; text-align: center;">
        Por favor, use o código abaixo para confirmar seu acesso:
      </p>

      <div style="margin: 30px auto; text-align: center; background-color: #f4f4f4;
        padding: 15px; border-radius: 8px; width: fit-content;">
        <span style="font-size: 24px; font-weight: bold; color: #333333;
          letter-spacing: 4px;">${code}</span>
      </div>

      <p style="color: #555555; font-size: 14px; text-align: center;">
        Se você não solicitou este código, por favor ignore este e-mail.
      </p>

      <p style="color: #888888; font-size: 12px; text-align: center; margin-top: 40px;">
        &copy; CLASSHERO | Todos os direitos reservados.
      </p>
    </div>
  `;
}
