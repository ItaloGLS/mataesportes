type AuthMode = 'login' | 'signup' | 'forgot';

export function authErrorMessage(error: unknown, mode: AuthMode): string {
  const details = error && typeof error === 'object' ? error as { code?: string; status?: number; message?: string } : {};
  const code = details.code ?? '';
  if (code === 'weak_password' || /password.*(weak|easy to guess)/i.test(details.message ?? '')) {
    return 'Essa senha é fácil de adivinhar ou já apareceu em vazamentos. Escolha outra, mais longa e diferente.';
  }
  if (code === 'over_email_send_rate_limit') return 'O limite de envio de e-mails foi atingido. Aguarde antes de tentar novamente.';
  if (code === 'over_request_rate_limit' || details.status === 429) return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.';
  if (code === 'email_address_invalid') return 'Confira seu e-mail e use um endereço válido que possa receber mensagens.';
  if (code === 'email_not_confirmed') return 'Confirme seu cadastro pelo link enviado ao seu e-mail antes de entrar.';
  if (code === 'signup_disabled') return 'Novos cadastros estão indisponíveis no momento. Tente novamente mais tarde.';
  return mode === 'login'
    ? 'Não foi possível entrar. Confira e-mail, senha e a confirmação do cadastro.'
    : 'Não foi possível concluir. Confira os dados e tente novamente.';
}