import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/lib/store';
import { Shell } from '@/components/Shell';
import { Button } from '@/components/ui/button';
import { metadata } from '@/components/RouteStates';
import { authErrorMessage } from '@/lib/auth-errors';
import logoMark from '@/assets/logo-mark.png';

export const Route = createFileRoute('/auth')({ head: () => metadata('Entrar e criar conta', 'Sua conta esportiva na Mata Sul de Pernambuco.'), component: Auth });

const input = 'mt-1 w-full rounded-sm border border-input bg-background px-3 py-3 outline-none transition focus:border-foreground focus:ring-2 focus:ring-accent/50';

function Auth() {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const { user } = useSession();
  const navigate = useNavigate();
  const titulo = mode === 'signup' ? 'Criar conta' : mode === 'forgot' ? 'Recuperar senha' : 'Entrar';

  return (
    <Shell bare>
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-10">
          <div className="w-full max-w-[440px]">
            <div className="rounded-[20px] border bg-background p-8 md:p-10">
            <div className="flex items-center gap-3">
              <img src={logoMark} alt="" className="h-10 w-auto" />
              <div>
                <p className="font-display text-lg font-extrabold uppercase leading-none tracking-wide">Mata Esportes</p>
                <p className="text-xs text-muted-foreground">A rede esportiva da Mata Sul</p>
              </div>
            </div>
            <span className="mt-5 block h-1 w-10 bg-accent" aria-hidden="true" />
            <h1 className="mt-3 font-display text-4xl font-extrabold uppercase">{titulo}</h1>
            {user ? (
              <div className="mt-6 space-y-4">
                <p>Você já está conectado.</p>
                <Button asChild><Link to="/perfil/$id" params={{ id: user.id }}>Meu perfil</Link></Button>
              </div>
            ) : (
              <>
                <form className="mt-6 space-y-4" onSubmit={async (e) => {
                  e.preventDefault(); setBusy(true); setMessage(''); setFailed(false);
                  const f = new FormData(e.currentTarget);
                  const email = String(f.get('email')); const password = String(f.get('password'));
                  try {
                    if (mode === 'forgot') {
                      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' });
                      if (error) throw error;
                      setMessage('Se houver uma conta, você receberá um link para redefinir a senha.');
                    } else if (mode === 'signup') {
                      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin, data: { nome: String(f.get('nome')) } } });
                      if (error) throw error;
                      if (data.session) await navigate({ to: '/' }); else setMessage('Confira seu e-mail para confirmar o cadastro antes de entrar.');
                    } else {
                      const { error } = await supabase.auth.signInWithPassword({ email, password });
                      if (error) throw error;
                      await navigate({ to: '/' });
                    }
                  } catch (error) { setFailed(true); setMessage(authErrorMessage(error, mode)); } finally { setBusy(false); }
                }}>
                  {mode === 'signup' && <label className="block text-sm font-semibold">Nome<input name="nome" aria-label="Nome" required minLength={2} maxLength={100} className={input} /></label>}
                  <label className="block text-sm font-semibold">E-mail<input name="email" aria-label="E-mail" type="email" autoComplete="email" required className={input} /></label>
                  {mode !== 'forgot' && (
                    <div>
                      <label className="block text-sm font-semibold">Senha<input name="password" aria-label="Senha" type="password" minLength={8} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required className={input} /></label>
                      {mode === 'login' && <button type="button" onClick={() => { setMode('forgot'); setMessage(''); }} className="mt-1.5 block w-full text-right text-xs text-muted-foreground transition hover:text-foreground">Esqueci minha senha</button>}
                    </div>
                  )}
                  <Button type="submit" disabled={busy} className="w-full bg-accent font-bold text-accent-foreground hover:bg-accent/80">{busy ? 'Aguarde…' : mode === 'signup' ? 'Cadastrar' : mode === 'forgot' ? 'Enviar link' : 'Entrar'}</Button>
                </form>
                {message && <p role={failed ? 'alert' : 'status'} className="mt-4 text-sm">{message}</p>}
                <p className="mt-6 border-t pt-5 text-sm text-muted-foreground">
                  {mode === 'signup' ? (
                    <>Já tem conta? <button type="button" onClick={() => { setMode('login'); setMessage(''); }} className="font-bold text-foreground underline decoration-accent decoration-2 underline-offset-4">Entrar</button></>
                  ) : mode === 'forgot' ? (
                    <>Lembrou a senha? <button type="button" onClick={() => { setMode('login'); setMessage(''); }} className="font-bold text-foreground underline decoration-accent decoration-2 underline-offset-4">Entrar</button></>
                  ) : (
                    <>Ainda não tem conta? <button type="button" onClick={() => { setMode('signup'); setMessage(''); }} className="font-bold text-foreground underline decoration-accent decoration-2 underline-offset-4">Criar conta</button></>
                  )}
                </p>
              </>
            )}
            </div>
            <p className="mt-6 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">Atletas · Treinadores · Olheiros da Mata Sul</p>
          </div>
        </div>
    </Shell>
  );
}
