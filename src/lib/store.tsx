import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery, useQueries, useQueryClient, useMutation, useIsMutating, type QueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import type { User as AuthUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getFollowing, getMyLikes, mutatePlatform } from './platform.functions';
import type { Action } from './domain/schemas';
import { validateImage } from './domain/schemas';
import type { Comentario, Post } from './data';
import { toast } from 'sonner';
import { addComment, removeComment, setLikedFlag, shiftComments, shiftLikes, type FeedPages } from './domain/social-cache';

interface SessionState { user:AuthUser|null; ready:boolean }
const SessionCtx=createContext<SessionState>({user:null,ready:false});
export function SessionProvider({children}:{children:ReactNode}){
 const [state,setState]=useState<SessionState>({user:null,ready:false});
 const queryClient=useQueryClient(); const router=useRouter();
 useEffect(()=>{
  let alive=true; let revision=0;
  const refresh=async()=>{const current=++revision;const {data}=await supabase.auth.getUser();if(alive && current===revision)setState({user:data.user,ready:true});};
  void refresh();
  const {data:{subscription}}=supabase.auth.onAuthStateChange(event=>{
   if(event!=='SIGNED_IN' && event!=='SIGNED_OUT' && event!=='USER_UPDATED')return;
   if(event==='SIGNED_OUT'){revision++;setState({user:null,ready:true});void queryClient.cancelQueries();queryClient.clear();}
   else{queueMicrotask(()=>void refresh());void queryClient.invalidateQueries();}
   void router.invalidate();
  });
  return()=>{alive=false;subscription.unsubscribe();};
 },[queryClient,router]);
 return <SessionCtx.Provider value={state}>{children}</SessionCtx.Provider>;
}
export const useSession=()=>useContext(SessionCtx);
export async function uploadImage(file:File,userId:string){
 validateImage(file);
 const extension=file.type==='image/jpeg'?'jpg':file.type==='image/png'?'png':'webp';
 const path=`${userId}/${crypto.randomUUID()}.${extension}`;
 const {error}=await supabase.storage.from('sports-media').upload(path,file,{contentType:file.type,upsert:false});
 if(error)throw new Error('Não foi possível enviar a imagem.');
 return path;
}

const SOCIAL=(a:Action)=>a.kind==='like'||a.kind==='comment.create';
/** Only the screens touched by a write are refreshed. */
function keysFor(a:Action):unknown[][]{
 switch(a.kind){
  case 'post.create': case 'post.update': case 'post.delete': return [['feed']];
  case 'comment.delete': return [['comments'],['feed']];
  case 'event.create': case 'event.update': case 'event.delete': return [['events'],['event'],['search']];
  case 'registration': return [['events'],['event',a.id],['inscricoes'],['participantes',a.id]];
  case 'follow': return [['profile',a.id],['following']];
  case 'profile': return [['profile'],['feed'],['search'],['comments'],['event']];
  case 'opportunity.create': case 'opportunity.update': case 'opportunity.delete': return [['opportunities']];
  case 'report': return [['reports'],['feed'],['comments'],['opportunities']];
  case 'profile_private.save': return [['profile_private'],['profile']];
  case 'moderation.review_report': return [['reports'],['moderation'],['feed']];
  case 'moderation.review_opportunity': return [['opportunities'],['moderation']];
  case 'moderation.apply_sanction': return [['moderation'],['profile']];
  default: return [];
 }
}
interface Optimistic { kind:'like'|'comment'; userId:string; postId:string; active?:boolean; commentId?:string }
function applyOptimistic(qc:QueryClient,a:Action,userId:string,userName:string):Optimistic|undefined{
 if(a.kind==='like'){
  qc.setQueriesData<FeedPages>({queryKey:['feed']},d=>d&&shiftLikes(d,a.id,a.active?1:-1));
  qc.setQueriesData<Record<string,boolean>>({queryKey:['my-likes',userId]},d=>d&&setLikedFlag(d,a.id,a.active));
  return {kind:'like',userId,postId:a.id,active:a.active};
 }
 if(a.kind==='comment.create'){
  const commentId=crypto.randomUUID();
  qc.setQueriesData<FeedPages>({queryKey:['feed']},d=>d&&shiftComments(d,a.id,1));
  qc.setQueryData<Comentario[]>(['comments',a.id],d=>addComment(d??[],{id:commentId,autor:userId,autorNome:userName,texto:a.texto,created_at:new Date().toISOString()}));
  return {kind:'comment',userId,postId:a.id,commentId};
 }
 return undefined;
}
function rollback(qc:QueryClient,o:Optimistic){
 if(o.kind==='like'){
  qc.setQueriesData<FeedPages>({queryKey:['feed']},d=>d&&shiftLikes(d,o.postId,o.active?-1:1));
  qc.setQueriesData<Record<string,boolean>>({queryKey:['my-likes',o.userId]},d=>d&&setLikedFlag(d,o.postId,!o.active));
 }else{
  qc.setQueriesData<FeedPages>({queryKey:['feed']},d=>d&&shiftComments(d,o.postId,-1));
  qc.setQueryData<Comentario[]>(['comments',o.postId],d=>d&&removeComment(d,o.commentId??''));
 }
}

/** Writes for every screen: identity is checked on the server, RLS owns authorization. */
export function useActions(postId?:string){
 const {user,ready}=useSession();const qc=useQueryClient();
 const server=useServerFn(mutatePlatform);
 const mutation=useMutation({
  mutationKey:['platform-action'],
  mutationFn:(action:Action)=>server({data:action}),
  onMutate:async(action)=>{
   if(!user||!SOCIAL(action))return undefined;
   await Promise.all([qc.cancelQueries({queryKey:['feed']}),qc.cancelQueries({queryKey:['my-likes',user.id]}),qc.cancelQueries({queryKey:['comments',action.id]})]);
   return applyOptimistic(qc,action,user.id,String(user.user_metadata?.['nome']??'Você'));
  },
  onSuccess:async(_r,action)=>{
   if(SOCIAL(action)){await qc.invalidateQueries({queryKey:['feed'],refetchType:'none'});return;}
   await Promise.all(keysFor(action).map(queryKey=>qc.invalidateQueries({queryKey})));
  },
  onError:(_e,_a,optimistic)=>{if(optimistic)rollback(qc,optimistic);toast.error('Não foi possível salvar. Confira os dados e tente novamente.');},
  onSettled:(_r,_e,action)=>{
   if(SOCIAL(action) && qc.isMutating({mutationKey:['platform-action']})===1){
    if(action.kind==='comment.create')void qc.invalidateQueries({queryKey:['comments',action.id]});
    else if(user)void qc.invalidateQueries({queryKey:['my-likes',user.id]});
   }
  },
 });
 const socialPending=useIsMutating({mutationKey:['platform-action'],predicate:m=>{
  const action=m.state.variables as Action | undefined;
  return Boolean(action && SOCIAL(action) && 'id' in action && action.id===postId);
 }});
 const act=async(action:Action)=>{if(!user){toast.info('Entre na sua conta para continuar.');return false;}await mutation.mutateAsync(action);return true;};
 return {user,ready,act,pending:mutation.isPending,socialPending:socialPending>0,
  toggleLike:(id:string,liked:boolean)=>act({kind:'like',id,active:!liked}),
  comentar:(id:string,texto:string)=>act({kind:'comment.create',id,texto}),
  publicar:(p:Pick<Post,'texto'|'tipo'|'modalidade'|'cidade'> & {image_path?:string|null})=>act({kind:'post.create',value:{...p,image_path:p.image_path??null}}),
 };
}

/** Liked flags for loaded feed pages, one small request per page. */
export function useLikedPosts(pages:{posts:{id:string}[]}[]){
 const {user,ready}=useSession();const serverLikes=useServerFn(getMyLikes);
 const results=useQueries({queries:pages.map(page=>{const ids=page.posts.map(p=>p.id);return {
  queryKey:['my-likes',user?.id,ids.join(',')],enabled:ready&&Boolean(user)&&ids.length>0,staleTime:5*60*1000,
  queryFn:()=>serverLikes({data:{postIds:ids}}),
 };})});
 return useMemo(()=>{const s=new Set<string>();for(const r of results)for(const [id,v] of Object.entries(r.data??{}))if(v)s.add(id);return s;},[results]);
}

export function useRegistrations(){
 const {user,ready}=useSession();
 const personal=useQuery({queryKey:['inscricoes',user?.id],enabled:ready && Boolean(user),staleTime:60000,queryFn:async()=>{const rows:{evento_id:string}[]=[];for(let start=0;;start+=500){const {data,error}=await supabase.from('inscricoes').select('evento_id').eq('user_id',user?.id??'').order('evento_id').range(start,start+499);if(error)throw error;rows.push(...(data??[]));if((data?.length??0)<500)return rows;}}});
 return useMemo(()=>new Set(personal.data?.map(i=>i.evento_id)??[]),[personal.data]);
}

export function useFollowing(id:string,enabled:boolean){
 const {user,ready}=useSession();const server=useServerFn(getFollowing);
 return useQuery({queryKey:['following',user?.id,id],enabled:enabled&&ready&&Boolean(user),staleTime:60000,queryFn:()=>server({data:{id}})}).data??false;
}
