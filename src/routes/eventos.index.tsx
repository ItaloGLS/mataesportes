import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Plus,X,CalendarDays } from 'lucide-react';
import { Shell,Chip,FadeIn } from '@/components/Shell';
import { Button } from '@/components/ui/button';
import { EventoCard,eventoEncerrado } from '@/components/EventoCard';
import { EventForm } from '@/components/EventForm';
import { useStore } from '@/lib/store';
import { MODALIDADES } from '@/lib/data';
import { platformQuery } from '@/lib/queries';
import { metadata,LoadError,Missing,SignInPrompt,EmptyState } from '@/components/RouteStates';
export const Route=createFileRoute('/eventos/')({validateSearch:(s:Record<string,unknown>)=>{const modalidade=typeof s['modalidade']==='string'?s['modalidade']:undefined;return modalidade?{modalidade}:{};},loader:async({context})=>{await context.queryClient.ensureQueryData(platformQuery);},errorComponent:LoadError,notFoundComponent:Missing,head:()=>metadata('Eventos e competições','Calendário esportivo da Mata Sul de Pernambuco e inscrições.'),component:Eventos});
function Eventos(){const {eventos,user}=useStore();const {modalidade:mod}=Route.useSearch();const navigate=Route.useNavigate();const [form,setForm]=useState(false);const lista=mod?eventos.filter(e=>e.modalidade===mod):eventos;const abertos=lista.filter(e=>!eventoEncerrado(e)).sort((a,b)=>a.data.localeCompare(b.data));const resultados=lista.filter(eventoEncerrado).sort((a,b)=>b.data.localeCompare(a.data));
 return <Shell><div className="space-y-5 px-4 py-6 md:px-8"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-extrabold uppercase">Competições regionais</h1>{user?<Button onClick={()=>setForm(!form)}>{form?<X/>:<Plus/>}{form?'Fechar':'Criar evento'}</Button>:<SignInPrompt/>}</div>{form&&user&&<EventForm onDone={()=>setForm(false)}/>}<div className="flex gap-2 overflow-x-auto pb-1"><Chip active={!mod} onClick={()=>void navigate({search:{}})}>Todas</Chip>{MODALIDADES.map(m=><Chip key={m} active={mod===m} onClick={()=>void navigate({search:{modalidade:m}})}>{m}</Chip>)}</div><div className="grid gap-4 md:grid-cols-2">{abertos.map((e,i)=><FadeIn key={e.id} i={i}><EventoCard e={e}/></FadeIn>)}</div>{resultados.length>0&&<><h2 className="pt-4 text-2xl font-bold uppercase">Resultados</h2><div className="grid gap-4 md:grid-cols-2">{resultados.map((e,i)=><FadeIn key={e.id} i={i}><EventoCard e={e}/></FadeIn>)}</div></>}{!lista.length&&<div className="py-4"><EmptyState icon={CalendarDays} title={mod?"Nenhum evento nessa modalidade ainda.":"Nenhum evento publicado ainda."} action={user?<Button variant="outline" className="touch-control" onClick={()=>setForm(true)}>Criar evento</Button>:undefined}/></div>}</div></Shell>;
}
