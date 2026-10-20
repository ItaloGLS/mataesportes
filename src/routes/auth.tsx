import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/lib/store';
import { Shell } from '@/components/Shell';
import { Button } from '@/components/ui/button';
import { metadata } from '@/components/RouteStates';
export const Route=createFileRoute('/auth')({head:()=>metadata('Entrar e criar conta','Sua conta esportiva na Mata Sul de Pernambuco.'),component:Auth});
function Auth(){
 const [mode,setMode]=useState<'login'|'signup'|'forgot'>('login');const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [failed,setFailed]=useState(false);const {user}=useSession();const navigate=useNavigate();
 return <Shell><div className="mx-auto max-w-md space-y-6 px-4 py-12"><h1 className="text-4xl font-extrabold uppercase">{mode==='signup'?'Criar conta':mode==='forgot'?'Recuperar senha':'Entrar'}</h1>{user?<><p>Você já está conectado.</p><Button asChild><Link to="/perfil/$id" params={{id:user.id}}>Meu perfil</Link></Button></>:<>
 <form className="space-y-4" onSubmit={async e=>{e.preventDefault();setBusy(true);setMessage('');setFailed(false);const f=new FormData(e.currentTarget);const email=String(f.get('email'));const password=String(f.get('password'));try{
 if(mode==='forgot'){const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+'/reset-password'});if(error)throw error;setMessage('Se houver uma conta, você receberá um link para redefinir a senha.');}
 else if(mode==='signup'){const {data,error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin,data:{nome:String(f.get('nome'))}}});if(error)throw error;if(data.session)await navigate({to:'/'});else setMessage('Confira seu e-mail para confirmar o cadastro antes de entrar.');}
 else{const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;await navigate({to:'/'});}
 }catch{setFailed(true);setMessage(mode==='login'?'Não foi possível entrar. Confira e-mail, senha e a confirmação do cadastro.':'Não foi possível concluir. Confira os dados e tente novamente.');}finally{setBusy(false);}}}>
 {mode==='signup'&&<label className="block text-sm font-semibold">Nome<input name="nome" aria-label="Nome" required minLength={2} maxLength={100} className="mt-1 w-full rounded-sm border bg-card px-3 py-3"/></label>}
 <label className="block text-sm font-semibold">E-mail<input name="email" aria-label="E-mail" type="email" autoComplete="email" required className="mt-1 w-full rounded-sm border bg-card px-3 py-3"/></label>
 {mode!=='forgot'&&<label className="block text-sm font-semibold">Senha<input name="password" aria-label="Senha" type="password" minLength={8} autoComplete={mode==='signup'?'new-password':'current-password'} required className="mt-1 w-full rounded-sm border bg-card px-3 py-3"/></label>}
 <Button type="submit" disabled={busy} className="w-full">{busy?'Aguarde…':mode==='signup'?'Cadastrar':mode==='forgot'?'Enviar link':'Entrar'}</Button>
 </form>
 {message&&<p role={failed?'alert':'status'} className="text-sm">{message}</p>}
 <div className="flex flex-wrap gap-2"><Button variant="link" onClick={()=>{setMode(mode==='signup'?'login':'signup');setMessage('');}}>{mode==='signup'?'Já tenho conta':'Criar conta'}</Button><Button variant="link" onClick={()=>{setMode(mode==='forgot'?'login':'forgot');setMessage('');}}>{mode==='forgot'?'Voltar':'Esqueci minha senha'}</Button></div>
 </>}</div></Shell>;
}
