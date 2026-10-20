import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from './ui/button';
import { CIDADES,MODALIDADES,marcaLabel,participanteLabel,type Evento,type ResultadoItem } from '@/lib/data';
import { useStore } from '@/lib/store';
const input='mt-1 w-full rounded-sm border bg-card px-3 py-2 text-sm';
export function EventForm({event,onDone}:{event?:Evento;onDone:()=>void}){
 const {act,pending}=useStore();const [message,setMessage]=useState('');
 const [modalidade,setModalidade]=useState(event?.modalidade??MODALIDADES[0]!);
 const [encerrado,setEncerrado]=useState(event?.encerrado??false);
 const [resultado,setResultado]=useState<ResultadoItem[]>(event?.resultado??[]);
 const setRow=(i:number,patch:Partial<ResultadoItem>)=>setResultado(r=>r.map((x,j)=>j===i?{...x,...patch}:x));
 return <form className="grid gap-4 border-b py-6 md:grid-cols-2" onSubmit={async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const value={nome:String(f.get('nome')),modalidade,cidade:String(f.get('cidade')),data:String(f.get('data')),horario:String(f.get('horario')??''),local:String(f.get('local')),vagas:Number(f.get('vagas')),valor:String(f.get('valor'))||'Gratuito',descricao:String(f.get('descricao')),categorias:String(f.get('categorias')).split(',').map(s=>s.trim()).filter(Boolean),encerrado,resultado:encerrado?resultado.filter(r=>r.nome.trim()).map((r,i)=>({...r,posicao:r.posicao||i+1})):[]};try{await act(event?{kind:'event.update',id:event.id,value}:{kind:'event.create',value});onDone();}catch{setMessage('Não foi possível salvar. Confira os campos, o horário e o número de vagas.');}}}>
 <label className="text-xs font-bold md:col-span-2">Nome do evento<input aria-label="Nome do evento" name="nome" required minLength={3} maxLength={200} defaultValue={event?.nome} className={input}/></label>
 <label className="text-xs font-bold">Modalidade<select aria-label="Modalidade do evento" name="modalidade" value={modalidade} onChange={e=>setModalidade(e.target.value)} className={input}>{MODALIDADES.map(m=><option key={m}>{m}</option>)}</select></label>
 <label className="text-xs font-bold">Cidade<select aria-label="Cidade do evento" name="cidade" defaultValue={event?.cidade} className={input}>{CIDADES.map(c=><option key={c}>{c}</option>)}</select></label>
 <label className="text-xs font-bold">Data<input aria-label="Data do evento" name="data" type="date" required defaultValue={event?.data} className={input}/></label>
 <label className="text-xs font-bold">Horário<input aria-label="Horário do evento" name="horario" type="time" defaultValue={event?.horario} className={input}/></label>
 <label className="text-xs font-bold">Local<input aria-label="Local do evento" name="local" required maxLength={300} defaultValue={event?.local} className={input}/></label>
 <label className="text-xs font-bold">Vagas<input aria-label="Vagas" name="vagas" type="number" min={Math.max(1,event?.inscritos??1)} max={100000} required defaultValue={event?.vagas} className={input}/></label>
 <label className="text-xs font-bold">Valor<input aria-label="Valor" name="valor" maxLength={100} defaultValue={event?.valor??'Gratuito'} className={input}/></label>
 <label className="text-xs font-bold">Categorias<input aria-label="Categorias" name="categorias" placeholder="Separadas por vírgula" defaultValue={event?.categorias.join(', ')} className={input}/></label>
 <label className="text-xs font-bold md:col-span-2">Detalhes<textarea aria-label="Detalhes do evento" name="descricao" maxLength={5000} rows={3} defaultValue={event?.descricao} className={input}/></label>
 {event&&<div className="space-y-3 md:col-span-2">
  <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={encerrado} onChange={e=>setEncerrado(e.target.checked)} className="h-4 w-4 accent-accent"/>Evento encerrado (fecha as inscrições)</label>
  {encerrado&&<div className="space-y-2">
   <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Resultado final</p>
   {resultado.map((r,i)=><div key={i} className="grid grid-cols-[64px_1fr_1fr_auto] gap-2">
    <input aria-label="Posição" type="number" min={1} value={r.posicao} onChange={e=>setRow(i,{posicao:Number(e.target.value)})} className={input}/>
    <input aria-label={participanteLabel(modalidade)} placeholder={participanteLabel(modalidade)} maxLength={200} value={r.nome} onChange={e=>setRow(i,{nome:e.target.value})} className={input}/>
    <input aria-label={marcaLabel(modalidade)} placeholder={marcaLabel(modalidade)} maxLength={100} value={r.marca} onChange={e=>setRow(i,{marca:e.target.value})} className={input}/>
    <Button type="button" variant="ghost" size="icon" aria-label="Remover colocação" onClick={()=>setResultado(x=>x.filter((_,j)=>j!==i))}><X/></Button>
   </div>)}
   <Button type="button" variant="outline" onClick={()=>setResultado(x=>[...x,{posicao:x.length+1,nome:'',marca:''}])}><Plus/>Adicionar colocação</Button>
  </div>}
 </div>}
 {message&&<p role="alert" className="text-sm md:col-span-2">{message}</p>}
 <div className="flex gap-3 md:col-span-2"><Button disabled={pending} type="submit">{pending?'Salvando…':event?'Salvar evento':'Publicar evento'}</Button><Button variant="ghost" type="button" onClick={onDone}>Cancelar</Button></div>
 </form>;
}
