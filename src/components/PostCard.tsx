import { useState } from 'react';
import { motion,AnimatePresence } from 'motion/react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Heart,MessageCircle,MapPin,Send,Pencil,Trash2,MoreVertical,Flag } from 'lucide-react';
import type { Post } from '@/lib/data';
import { useActions } from '@/lib/store';
import { commentsQuery } from '@/lib/queries';
import { Avatar } from './Shell';
import { Button } from './ui/button';
import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger } from './ui/dropdown-menu';
import { SignInPrompt } from './RouteStates';
import { ReportModal } from './ReportModal';

function Comments({postId,count}:{postId:string;count:number}){
 const {user,act,pending,socialPending,comentar}=useActions(postId);const [txt,setTxt]=useState('');
 const comments=useQuery(commentsQuery(postId));
 const safely=async(fn:()=>Promise<unknown>)=>{try{await fn();}catch{/* mutation shows feedback */}};
 return <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} className="mt-3 space-y-3 overflow-hidden">
  {comments.isPending&&count>0&&<p className="text-sm text-muted-foreground">Carregando comentários…</p>}
  {comments.isError&&<p role="alert" className="text-sm">Não foi possível carregar os comentários.</p>}
  {comments.data?.map(c=><div key={c.id} className="flex items-center gap-2 rounded-sm bg-muted px-3 py-2 text-sm"><p className="min-w-0 flex-1 break-words"><strong>{c.autorNome}</strong> {c.texto}</p>{user?.id===c.autor&&<Button variant="ghost" size="icon" title="Excluir comentário" aria-label="Excluir comentário" disabled={pending||socialPending} onClick={()=>void safely(()=>act({kind:'comment.delete',id:c.id}))}><Trash2/></Button>}</div>)}
  {user?<form className="flex gap-2" onSubmit={e=>{e.preventDefault();const text=txt.trim();if(text){setTxt('');void safely(async()=>{try{await comentar(postId,text);}catch(error){setTxt(current=>current||text);throw error;}});}}}><input aria-label="Comentário" maxLength={2000} value={txt} onChange={e=>setTxt(e.target.value)} placeholder="Escreva um comentário…" className="min-w-0 flex-1 rounded-sm border bg-background px-3 py-2 text-sm"/><Button type="submit" size="icon" aria-label="Enviar" disabled={!txt.trim()||socialPending}><Send/></Button></form>:<SignInPrompt/>}
 </motion.div>;
}

export function PostCard({post,liked}:{post:Post;liked:boolean}){
 const {toggleLike,user,act,pending,socialPending}=useActions(post.id);const [open,setOpen]=useState(false);const [editing,setEditing]=useState(false);const [reporting,setReporting]=useState(false);const [body,setBody]=useState(post.texto);const autor=post.author;const tipoCls=post.tipo==='Peneira'?'bg-seal text-seal-foreground':post.tipo==='Conquista'?'bg-accent text-accent-foreground':post.tipo==='Treino'?'bg-primary text-primary-foreground':'bg-secondary text-secondary-foreground';
 const safely=async(fn:()=>Promise<unknown>)=>{try{await fn();}catch{/* mutation shows feedback */}};
 return <article className="mobile-post border-b border-border bg-card px-4 py-6 sm:px-6"><header className="flex items-center gap-3"><Avatar iniciais={autor.iniciais} src={autor.avatarUrl}/><div className="min-w-0 flex-1"><Link to="/perfil/$id" params={{id:autor.id}} className="font-bold hover:underline">{autor.nome}</Link><p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3"/>{post.cidade} · {post.tempo}</p></div><span className={`rounded-sm px-2 py-1 text-[10px] font-bold uppercase ${tipoCls}`}>{post.tipo}</span></header>
 {editing?<form className="mt-4 space-y-3" onSubmit={e=>{e.preventDefault();void safely(async()=>{await act({kind:'post.update',id:post.id,value:{texto:body,tipo:post.tipo,modalidade:post.modalidade,cidade:post.cidade,image_path:post.image_path}});setEditing(false);});}}><textarea aria-label="Editar publicação" value={body} onChange={e=>setBody(e.target.value)} maxLength={5000} required rows={3} className="w-full rounded-sm border bg-background p-3"/><div className="flex gap-2"><Button disabled={pending}>Salvar publicação</Button><Button variant="ghost" type="button" onClick={()=>setEditing(false)}>Cancelar</Button></div></form>:<p className="mt-4 whitespace-pre-wrap leading-relaxed">{post.texto}</p>}
 {post.imageUrl&&<a href={post.imageUrl} target="_blank" rel="noopener noreferrer" aria-label="Abrir foto inteira" className="mt-4 block"><img src={post.imageUrl} alt={`Foto da publicação de ${autor.nome}`} loading="lazy" decoding="async" className="aspect-[4/3] max-h-[420px] w-full rounded-sm object-cover"/></a>}
 <footer className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3"><Button variant="ghost" aria-label="Curtir publicação" aria-pressed={liked} disabled={socialPending||!user} onClick={()=>void safely(()=>toggleLike(post.id,liked))} className={`rounded-sm px-2 ${liked?'bg-accent/30 text-foreground':'text-muted-foreground'}`}><motion.span key={String(liked)} initial={{scale:liked?0.4:1}} animate={{scale:1}}><Heart className={`h-4 w-4 ${liked?'fill-current':''}`}/></motion.span>{post.likes}</Button><Button variant="ghost" aria-label="Comentários" aria-expanded={open} onClick={()=>setOpen(!open)} className="px-2 text-muted-foreground"><MessageCircle/>{post.comentarios}</Button>{user&&<DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="ml-auto" title="Opções da publicação" aria-label="Opções da publicação"><MoreVertical/></Button></DropdownMenuTrigger><DropdownMenuContent align="end">{user.id===post.autor?<><DropdownMenuItem onClick={()=>{setBody(post.texto);setEditing(true);}}><Pencil className="h-4 w-4"/>Editar</DropdownMenuItem><DropdownMenuItem disabled={pending} className="text-destructive focus:text-destructive" onClick={()=>{if(window.confirm('Excluir esta publicação?'))void safely(()=>act({kind:'post.delete',id:post.id}));}}><Trash2 className="h-4 w-4"/>Excluir</DropdownMenuItem></>:<DropdownMenuItem onClick={()=>setReporting(true)} className="text-destructive focus:text-destructive"><Flag className="h-4 w-4"/>Denunciar publicação</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu>}</footer>
 <AnimatePresence>{open&&<Comments postId={post.id} count={post.comentarios}/>}</AnimatePresence>
 <ReportModal isOpen={reporting} onClose={()=>setReporting(false)} targetType="post" targetId={post.id} targetTitle={`Publicação de ${autor.nome}`} />
 </article>;
}
