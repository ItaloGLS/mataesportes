import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { Database } from '@/integrations/supabase/types';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { actionSchema, isMinor } from './domain/schemas';
import { initials, FEED_PAGE_SIZE, type Author, type Comentario, type Evento, type FeedPage, type Oportunidade, type Perfil, type Post, type User } from './data';

type Db = ReturnType<typeof createClient<Database>>;
type EventRow = Database['public']['Tables']['eventos']['Row'];

/** Public read-only client: RLS applies as a visitor. */
function publicDb(): Db {
 const url = process.env['SUPABASE_URL']; const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
 if (!url || !key) throw new Error('Serviço indisponível');
 return createClient<Database>(url,key,{auth:{storage:undefined,persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>{const h=new Headers(init?.headers);if(key.startsWith('sb_') && h.get('Authorization')===`Bearer ${key}`)h.delete('Authorization');h.set('apikey',key);return fetch(input,{...init,headers:h});}}});
}

/** Short-lived read URLs for the photos a screen actually shows. */
async function signMedia(db: Db, paths: (string | null | undefined)[]) {
 const unique = [...new Set(paths.filter((p): p is string => Boolean(p)))];
 const media: Record<string, string> = {};
 if (!unique.length) return media;
 const url = process.env['SUPABASE_URL'] ?? '';
 const { data, error } = await db.storage.from('sports-media').createSignedUrls(unique, 3600);
 if (!error) for (const item of data ?? []) if (item.path && item.signedUrl) media[item.path] = item.signedUrl.replace(url, process.env['VITE_SUPABASE_URL'] ?? url);
 return media;
}

const fail = (what: string): never => { throw new Error(`Não foi possível carregar ${what}.`); };
const dateFormatter = new Intl.DateTimeFormat('pt-BR');
const author = (p: { id: string; nome: string; avatar_path: string | null } | null, media: Record<string, string>, fallbackId: string): Author =>
 p ? { id: p.id, nome: p.nome, iniciais: initials(p.nome), avatarUrl: p.avatar_path ? media[p.avatar_path] : undefined } : { id: fallbackId, nome: 'Atleta', iniciais: 'A' };

async function withCounts(db: Db, rows: EventRow[]): Promise<Evento[]> {
 if (!rows.length) return [];
 const { data, error } = await db.rpc('event_counts');
 if (error) fail('as inscrições');
 const counts = new Map((data ?? []).map(c => [c.id, Number(c.inscritos)]));
 return rows.map(e => ({ ...e, resultado: (Array.isArray(e.resultado) ? e.resultado : []) as unknown as Evento['resultado'], inscritos: counts.get(e.id) ?? 0 }));
}

const uuid = z.string().uuid();
const cursorSchema = z.object({ created_at: z.string().max(64), id: uuid }).nullable();

/** One page of the feed (15 posts), newest first, keyset-paginated. */
export const getFeed = createServerFn({ method: 'GET' })
 .inputValidator((input: unknown) => z.object({ cursor: cursorSchema.default(null), tipo: z.string().max(40).optional(), autor: uuid.optional() }).parse(input))
 .handler(async ({ data }): Promise<FeedPage> => {
  const db = publicDb();
  let q = db.from('posts').select('id,autor,tipo,texto,modalidade,cidade,image_path,created_at,likes_count,comments_count,profiles!posts_autor_fkey(id,nome,avatar_path)')
   .order('created_at', { ascending: false }).order('id', { ascending: false }).limit(FEED_PAGE_SIZE + 1);
  if (data.tipo) q = q.eq('tipo', data.tipo);
  if (data.autor) q = q.eq('autor', data.autor);
  if (data.cursor) q = q.or(`created_at.lt."${data.cursor.created_at}",and(created_at.eq."${data.cursor.created_at}",id.lt.${data.cursor.id})`);
  const { data: rows, error } = await q;
  if (error) fail('o feed');
  const page = (rows ?? []).slice(0, FEED_PAGE_SIZE);
  const media = await signMedia(db, page.flatMap(p => [p.image_path, p.profiles?.avatar_path]));
  const posts: Post[] = page.map(p => ({
   id: p.id, autor: p.autor, author: author(p.profiles, media, p.autor), tipo: p.tipo as Post['tipo'], texto: p.texto, modalidade: p.modalidade, cidade: p.cidade,
   created_at: p.created_at, tempo: dateFormatter.format(new Date(p.created_at)), image_path: p.image_path, imageUrl: p.image_path ? media[p.image_path] : undefined,
   likes: p.likes_count, comentarios: p.comments_count,
  }));
  const last = page.at(-1);
  return { posts, nextCursor: (rows?.length ?? 0) > FEED_PAGE_SIZE && last ? { created_at: last.created_at, id: last.id } : null };
 });

/** Comments of one post, loaded only when the post is opened. */
export const getComments = createServerFn({ method: 'GET' })
 .inputValidator((input: unknown) => z.object({ postId: uuid }).parse(input))
 .handler(async ({ data }): Promise<Comentario[]> => {
  const { data: rows, error } = await publicDb().from('comments').select('id,autor,texto,created_at,profiles!comments_autor_fkey(nome)')
   .eq('post_id', data.postId).order('created_at').order('id').limit(200);
  if (error) fail('os comentários');
  return (rows ?? []).map(c => ({ id: c.id, autor: c.autor, autorNome: c.profiles?.nome ?? 'Atleta', texto: c.texto, created_at: c.created_at }));
 });

/** Which of the given posts the signed-in viewer liked. */
export const getMyLikes = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
 .inputValidator((input: unknown) => z.object({ postIds: z.array(uuid).max(100) }).parse(input))
 .handler(async ({ data, context }) => {
  const flags: Record<string, boolean> = Object.fromEntries(data.postIds.map(id => [id, false]));
  if (!data.postIds.length) return flags;
  const { data: rows, error } = await context.supabase.from('likes').select('post_id').eq('user_id', context.userId).in('post_id', data.postIds);
  if (error) fail('suas curtidas');
  for (const r of rows ?? []) flags[r.post_id] = true;
  return flags;
 });

/** Events list; `upcoming` limits to today onward (home sidebar). */
export const getEvents = createServerFn({ method: 'GET' })
 .inputValidator((input: unknown) => z.object({ upcoming: z.boolean().default(false), limit: z.number().int().min(1).max(500).default(500) }).parse(input ?? {}))
 .handler(async ({ data }) => {
  const db = publicDb();
  let q = db.from('eventos').select('*').order('data').order('id').limit(data.limit);
  if (data.upcoming) q = q.eq('encerrado', false).gte('data', new Date().toISOString().slice(0, 10));
  const { data: rows, error } = await q;
  if (error) fail('os eventos');
  return withCounts(db, rows ?? []);
 });

export const getEvent = createServerFn({ method: 'GET' })
 .inputValidator((input: unknown) => z.object({ id: uuid }).parse(input))
 .handler(async ({ data }) => {
  const db = publicDb();
  const { data: row, error } = await db.from('eventos').select('*,profiles!eventos_organizador_fkey(id,nome,avatar_path)').eq('id', data.id).maybeSingle();
  if (error) fail('o evento');
  if (!row) return null;
  const { profiles, ...evento } = row;
  const [withCount] = await withCounts(db, [evento]);
  const media = await signMedia(db, [profiles?.avatar_path]);
  return { evento: withCount as Evento, organizador: profiles ? author(profiles, media, evento.organizador) : null };
 });

export const getOpportunities = createServerFn({ method: 'GET' }).handler(async (): Promise<Oportunidade[]> => {
 const db = publicDb();
 const { data: rows, error } = await db.from('oportunidades').select('*').eq('status', 'aprovada').order('created_at', { ascending: false }).order('id').limit(300);
 if (error) fail('as oportunidades');
 const ids = [...new Set((rows ?? []).map(o => o.autor))];
 const { data: people } = ids.length ? await db.from('profiles').select('id,nome').in('id', ids) : { data: [] };
 const names = new Map((people ?? []).map(p => [p.id, p.nome]));
 return (rows ?? []).map(o => ({ ...o, tipo: o.tipo as Oportunidade['tipo'], autorNome: names.get(o.autor) ?? null }));
});

export const getMyPrivateProfile = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth])
 .handler(async ({ context }) => {
  const { data, error } = await context.supabase
   .from('profile_private')
   .select('birthdate, parent_email, consent_given')
   .eq('user_id', context.userId)
   .maybeSingle();
  if (error) return null;
  return data;
 });

export const getProfile = createServerFn({ method: 'GET' })
 .inputValidator((input: unknown) => z.object({ id: uuid }).parse(input))
 .handler(async ({ data }): Promise<Perfil | null> => {
  const db = publicDb();
  const [p, podios, marcas, seguidores, seguindo] = await Promise.all([
   db.from('profiles').select('*').eq('id', data.id).maybeSingle(),
   db.from('podios').select('titulo,posicao,ano').eq('user_id', data.id).order('ano', { ascending: false }).limit(100),
   db.from('marcas').select('prova,valor').eq('user_id', data.id).limit(100),
   db.from('follows').select('follower', { count: 'exact', head: true }).eq('followed', data.id),
   db.from('follows').select('followed', { count: 'exact', head: true }).eq('follower', data.id),
  ]);
  if (p.error || podios.error || marcas.error) fail('o perfil');
  if (!p.data) return null;
  const media = await signMedia(db, [p.data.avatar_path]);
  return {
   id: p.data.id, nome: p.data.nome, role: p.data.atuacao as User['role'], cidade: p.data.cidade, modalidades: p.data.modalidades, bio: p.data.bio,
   iniciais: initials(p.data.nome), avatar_path: p.data.avatar_path, avatarUrl: p.data.avatar_path ? media[p.data.avatar_path] : undefined,
   podios: (podios.data ?? []).map(x => ({ titulo: x.titulo, posicao: x.posicao as 1 | 2 | 3, ano: x.ano })), marcas: marcas.data ?? [],
   seguidores: seguidores.count ?? 0, seguindo: seguindo.count ?? 0,
  };
 });

/** Whether the signed-in viewer follows a profile. */
export const getFollowing = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
 .inputValidator((input: unknown) => z.object({ id: uuid }).parse(input))
 .handler(async ({ data, context }) => {
  const { data: row, error } = await context.supabase.from('follows').select('followed').eq('follower', context.userId).eq('followed', data.id).maybeSingle();
  if (error) fail('o perfil');
  return Boolean(row);
 });

const SEARCH_LIMIT = 50;
/** Removes characters that carry meaning in filter expressions. */
export const searchTerm = (q: string) => q.replace(/[%*,()"\\.:]/g, ' ').trim().slice(0, 80);

export const searchDirectory = createServerFn({ method: 'GET' })
 .inputValidator((input: unknown) => z.object({ q: z.string().max(200).default(''), modalidade: z.string().max(40).default(''), cidade: z.string().max(60).default(''), atuacao: z.string().max(20).default('') }).parse(input))
 .handler(async ({ data }) => {
  const db = publicDb(); const t = searchTerm(data.q);
  let people = db.from('profiles').select('*').or('cidade.neq."",modalidades.neq.{}').order('nome').limit(SEARCH_LIMIT);
  if (data.modalidade) people = people.contains('modalidades', [data.modalidade]);
  if (data.cidade) people = people.eq('cidade', data.cidade);
  if (data.atuacao) people = people.eq('atuacao', data.atuacao);
  if (t) people = people.or(`nome.ilike.*${t}*,bio.ilike.*${t}*`);
  let events = db.from('eventos').select('*').order('data').limit(SEARCH_LIMIT);
  if (data.modalidade) events = events.eq('modalidade', data.modalidade);
  if (data.cidade) events = events.eq('cidade', data.cidade);
  if (t) events = events.ilike('nome', `%${t}%`);
  const [p, e] = await Promise.all([people, events]);
  if (p.error || e.error) fail('a busca');
  const media = await signMedia(db, (p.data ?? []).map(x => x.avatar_path));
  const pessoas = (p.data ?? []).map(x => ({ id: x.id, nome: x.nome, role: x.atuacao as User['role'], cidade: x.cidade, modalidades: x.modalidades, iniciais: initials(x.nome), avatarUrl: x.avatar_path ? media[x.avatar_path] : undefined }));
  return { pessoas, eventos: await withCounts(db, e.data ?? []) };
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
  case 'report':
   ({ error } = await db.from('reports').insert({
    reporter_id: uid,
    target_type: data.value.target_type,
    target_id: data.value.target_id,
    reason: data.value.reason,
   }));
   break;
  case 'profile_private.save':
   const under18 = isMinor(data.birthdate);
   const { error: privErr } = await db.from('profile_private').upsert({
    user_id: uid,
    birthdate: data.birthdate,
    parent_email: data.parent_email ?? null,
    consent_given: data.consent_given,
    updated_at: new Date().toISOString(),
   }, { onConflict: 'user_id' });
   if (privErr) { error = privErr; break; }
   ({ error } = await db.from('profiles').update({ is_minor: under18 }).eq('id', uid));
   break;
 }
 if(error){if(error.message.includes('Vagas'))throw new Error(error.message);if(error.message.includes('encerrado'))throw new Error('Evento encerrado.');throw new Error('Não foi possível salvar. Confira os dados e tente novamente.');}
 return {ok:true};
});
