import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQuery, useSuspenseQuery, useQueryClient, useMutation, useIsMutating } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import type { User as AuthUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { platformQuery } from './queries';
import { mutatePlatform } from './platform.functions';
import type { Action } from './domain/schemas';
import { validateImage } from './domain/schemas';
import type { Post, Evento } from './data';
import { toast } from 'sonner';
import { addCachedComment, removeCachedComment, setCachedLike } from './domain/social-cache';

type PlatformData = Awaited<ReturnType<typeof import('./platform.functions').getPlatform>>;

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
export function useStore(){
 const {data}=useSuspenseQuery(platformQuery);const {user,ready}=useSession();const qc=useQueryClient();
 const server=useServerFn(mutatePlatform);
 const mutation=useMutation({
  mutationKey:['platform-action'],
  mutationFn:(action:Action)=>server({data:action}),
  onMutate:async(action)=>{
   if(!user || (action.kind!=='like' && action.kind!=='comment.create'))return undefined;
   await qc.cancelQueries({queryKey:['platform']});
   const previous=qc.getQueryData<PlatformData>(['platform']);
   const commentId=crypto.randomUUID();
   const wasLiked=previous?.likes.some(l=>l.post_id===action.id && l.user_id===user.id)??false;
   qc.setQueryData<PlatformData>(['platform'],current=>{
    if(!current)return current;
    return action.kind==='like'?setCachedLike(current,action.id,user.id,action.active):addCachedComment(current,action.id,{id:commentId,autor:user.id,texto:action.texto});
   });
   return {userId:user.id,wasLiked,commentId};
  },
  onSuccess:async(_result,action)=>{
   await qc.invalidateQueries({queryKey:['platform'],refetchType:'none'});
   if(action.kind==='like' || action.kind==='comment.create')return;
   await qc.fetchQuery({...platformQuery,staleTime:0});
   if(action.kind==='registration'){await qc.invalidateQueries({queryKey:['inscricoes']});await qc.invalidateQueries({queryKey:['participantes']});}
  },
  onError:(_error,action,optimistic)=>{
   if(optimistic)qc.setQueryData<PlatformData>(['platform'],current=>{
    if(!current)return current;
    if(action.kind==='like')return setCachedLike(current,action.id,optimistic.userId,optimistic.wasLiked);
    return removeCachedComment(current,optimistic.commentId);
   });
   toast.error('Não foi possível salvar. Confira os dados e tente novamente.');
  },
  onSettled:(_result,_error,action)=>{
   if((action.kind==='like' || action.kind==='comment.create') && qc.isMutating({mutationKey:['platform-action']})===1){
    void qc.invalidateQueries({queryKey:['platform']}).catch(()=>{/* Keep immediate feedback; next refresh retries. */});
   }
  },
 });
 const socialPending=useIsMutating({mutationKey:['platform-action'],predicate:m=>{
  const action=m.state.variables as Action | undefined;
  return (action?.kind==='like' || action?.kind==='comment.create') && action.id===mutation.variables?.id;
 }});
 const personal=useQuery({queryKey:['inscricoes',user?.id],enabled:ready && Boolean(user),queryFn:async()=>{const rows:{evento_id:string}[]=[];for(let start=0;;start+=500){const {data,error}=await supabase.from('inscricoes').select('evento_id').eq('user_id',user?.id??'').order('evento_id').range(start,start+499);if(error)throw error;rows.push(...(data??[]));if((data?.length??0)<500)return rows;}}});
 const act=async(action:Action)=>{if(!user){toast.info('Entre na sua conta para continuar.');return false;}await mutation.mutateAsync(action);return true;};
 const liked=new Set(data.likes.filter(l=>l.user_id===user?.id).map(l=>l.post_id));
 return {...data,user,me:data.users.find(u=>u.id===user?.id),ready,pending:mutation.isPending,socialPending:socialPending>0,liked,inscricoes:new Set(personal.data?.map(i=>i.evento_id)??[]),userById:(id:string)=>data.users.find(u=>u.id===id),act,
  toggleLike:(id:string)=>act({kind:'like',id,active:!liked.has(id)}),
  comentar:(id:string,texto:string)=>act({kind:'comment.create',id,texto}),
  publicar:(p:Omit<Post,'id'|'autor'|'tempo'|'likes'|'comentarios'|'image_path'> & {image_path?:string|null})=>act({kind:'post.create',value:{...p,image_path:p.image_path??null}}),
  inscrever:(id:string)=>act({kind:'registration',id,active:!personal.data?.some(i=>i.evento_id===id)}),
  criarEvento:(e:Omit<Evento,'id'|'inscritos'|'organizador'>)=>act({kind:'event.create',value:e}),
 };
}
