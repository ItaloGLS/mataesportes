import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { actionSchema } from './domain/schemas';
import { initials, type User, type Post, type Evento, type Oportunidade } from './data';

export const getPlatform = createServerFn({method:'GET'}).handler(async () => {
 const url = process.env['SUPABASE_URL']; const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
 if (!url || !key) throw new Error('Serviço indisponível');
 const db = createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>{const h=new Headers(init?.headers);if(key.startsWith('sb_') && h.get('Authorization')===`Bearer ${key}`)h.delete('Authorization');h.set('apikey',key);return fetch(input,{...init,headers:h});}}});
 // Paginate every table: the Data API returns at most 1000 rows per request.
 async function all<T>(query: {range:(from:number,to:number)=>PromiseLike<{data:T[] | null;error:unknown}>}) {
  const rows:T[]=[]; for(let start=0;;start+=500){const {data,error}=await query.range(start,start+499);if(error)throw new Error('Não foi possível carregar os dados.'); rows.push(...(data??[]));if((data?.length??0)<500)return rows;}
 }
 const [profiles,podios,marcas,rawPosts,comments,likes,events,follows,counts,rawOpportunities] = await Promise.all([
  all(db.from('profiles').select('*').order('id')),all(db.from('podios').select('*').order('id')),all(db.from('marcas').select('*').order('id')),
  all(db.from('posts').select('*').order('created_at',{ascending:false}).order('id')),all(db.from('comments').select('*').order('created_at').order('id')),
  all(db.from('likes').select('*').order('post_id').order('user_id')),all(db.from('eventos').select('*').order('data').order('id')),all(db.from('follows').select('*').order('follower').order('followed')),db.rpc('event_counts'),
  all(db.from('oportunidades').select('*').order('created_at',{ascending:false}).order('id'))
 ]);
 if(counts.error)throw new Error('Não foi possível carregar as inscrições.');
 const mediaPaths = [...new Set([...profiles.map(p=>p.avatar_path),...rawPosts.map(p=>p.image_path)].filter((p):p is string=>Boolean(p)))];
 const media:Record<string,string>={};
 if(mediaPaths.length){const {data,error}=await db.storage.from('sports-media').createSignedUrls(mediaPaths,3600);if(!error)for(const item of data??[]){if(item.path && item.signedUrl)media[item.path]=item.signedUrl.replace(url,process.env['VITE_SUPABASE_URL']??url);}}
 const users:User[]=profiles.map(p=>({id:p.id,nome:p.nome,role:p.atuacao as User['role'],cidade:p.cidade,modalidades:p.modalidades,bio:p.bio,iniciais:initials(p.nome),avatar_path:p.avatar_path,avatarUrl:p.avatar_path?media[p.avatar_path]:undefined,podios:podios.filter(x=>x.user_id===p.id).map(x=>({titulo:x.titulo,posicao:x.posicao as 1|2|3,ano:x.ano})),marcas:marcas.filter(x=>x.user_id===p.id).map(x=>({prova:x.prova,valor:x.valor}))}));
 const posts:Post[]=rawPosts.map(p=>({...p,tipo:p.tipo as Post['tipo'],tempo:new Date(p.created_at).toLocaleDateString('pt-BR'),imageUrl:p.image_path?media[p.image_path]:undefined,likes:likes.filter(l=>l.post_id===p.id).length,comentarios:comments.filter(c=>c.post_id===p.id).map(c=>({id:c.id,autor:c.autor,texto:c.texto}))}));
 const eventos:Evento[]=events.map(e=>({...e,inscritos:Number(counts.data?.find(c=>c.id===e.id)?.inscritos??0)}));
 const oportunidades:Oportunidade[]=rawOpportunities.map(o=>({...o,tipo:o.tipo as Oportunidade['tipo']}));
 return {users,posts,eventos,likes,follows,oportunidades};
});

export const mutatePlatform = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>actionSchema.parse(input)).handler(async ({data,context})=>{
 const db=context.supabase; const uid=context.userId;
 let error: {message:string} | null = null;
 const ownedPost=async(id:string)=>{const {data:p}=await db.from('posts').select('autor').eq('id',id).maybeSingle();if(p?.autor!==uid)throw new Error('Publicação não encontrada ou sem permissão.');};
 const ownedEvent=async(id:string)=>{const {data:e}=await db.from('eventos').select('organizador').eq('id',id).maybeSingle();if(e?.organizador!==uid)throw new Error('Evento não encontrado ou sem permissão.');};
 const ownedOpportunity=async(id:string)=>{const {data:o}=await db.from('oportunidades').select('autor').eq('id',id).maybeSingle();if(o?.autor!==uid)throw new Error('Oportunidade não encontrada ou sem permissão.');};
 switch(data.kind){
  case 'post.create': ({error}=await db.from('posts').insert({...data.value,autor:uid}));break;
  case 'post.update': await ownedPost(data.id);({error}=await db.from('posts').update(data.value).eq('id',data.id).eq('autor',uid));break;
  case 'post.delete': await ownedPost(data.id);({error}=await db.from('posts').delete().eq('id',data.id).eq('autor',uid));break;
  case 'like': ({error}=data.active?await db.from('likes').upsert({post_id:data.id,user_id:uid},{onConflict:'post_id,user_id',ignoreDuplicates:true}):await db.from('likes').delete().eq('post_id',data.id).eq('user_id',uid));break;
  case 'comment.create': ({error}=await db.from('comments').insert({post_id:data.id,autor:uid,texto:data.texto}));break;
  case 'comment.delete': ({error}=await db.from('comments').delete().eq('id',data.id).eq('autor',uid));break;
  case 'event.create': ({error}=await db.from('eventos').insert({...data.value,organizador:uid}));break;
  case 'event.update': await ownedEvent(data.id);({error}=await db.from('eventos').update(data.value).eq('id',data.id).eq('organizador',uid));break;
  case 'event.delete': await ownedEvent(data.id);({error}=await db.from('eventos').delete().eq('id',data.id).eq('organizador',uid));break;
  case 'registration': ({error}=data.active?await db.from('inscricoes').insert({evento_id:data.id,user_id:uid}):await db.from('inscricoes').delete().eq('evento_id',data.id).eq('user_id',uid));break;
  case 'follow': if(data.id===uid)throw new Error('Não é possível seguir seu próprio perfil.');({error}=data.active?await db.from('follows').upsert({follower:uid,followed:data.id},{onConflict:'follower,followed',ignoreDuplicates:true}):await db.from('follows').delete().eq('follower',uid).eq('followed',data.id));break;
  case 'profile': ({error}=await db.rpc('save_sports_profile',{payload:data.value}));break;
  case 'opportunity.create': ({error}=await db.from('oportunidades').insert({...data.value,modalidade:data.value.modalidade||null,prazo:data.value.prazo||null,autor:uid}));break;
  case 'opportunity.update': await ownedOpportunity(data.id);({error}=await db.from('oportunidades').update({...data.value,modalidade:data.value.modalidade||null,prazo:data.value.prazo||null}).eq('id',data.id).eq('autor',uid));break;
  case 'opportunity.delete': await ownedOpportunity(data.id);({error}=await db.from('oportunidades').delete().eq('id',data.id).eq('autor',uid));break;
 }
 if(error){if(error.message.includes('Vagas'))throw new Error(error.message);if(error.message.includes('encerrado'))throw new Error('Evento encerrado.');throw new Error('Não foi possível salvar. Confira os dados e tente novamente.');}
 return {ok:true};
});
