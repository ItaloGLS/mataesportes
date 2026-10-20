import { useState } from 'react';
import { Button } from './ui/button';
import { CIDADES,MODALIDADES,type Evento } from '@/lib/data';
import { useStore } from '@/lib/store';
const input='mt-1 w-full rounded-sm border bg-card px-3 py-2 text-sm';
export function EventForm({event,onDone}:{event?:Evento;onDone:()=>void}){
 const {act,pending}=useStore();const [message,setMessage]=useState('');
 return <form className="grid gap-4 border-b py-6 md:grid-cols-2" onSubmit={async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const value={nome:String(f.get('nome')),modalidade:String(f.get('modalidade')),cidade:String(f.get('cidade')),data:String(f.get('data')),local:String(f.get('local')),vagas:Number(f.get('vagas')),valor:String(f.get('valor'))||'Gratuito',descricao:String(f.get('descricao')),categorias:String(f.get('categorias')).split(',').map(s=>s.trim()).filter(Boolean)};try{await act(event?{kind:'event.update',id:event.id,value}:{kind:'event.create',value});onDone();}catch{setMessage('Não foi possível salvar. Confira os campos e o número de vagas.');}}}>
 <label className="text-xs font-bold md:col-span-2">Nome do evento<input aria-label="Nome do evento" name="nome" required minLength={3} maxLength={200} defaultValue={event?.nome} className={input}/></label>
 <label className="text-xs font-bold">Modalidade<select aria-label="Modalidade do evento" name="modalidade" defaultValue={event?.modalidade} className={input}>{MODALIDADES.map(m=><option key={m}>{m}</option>)}</select></label>
 <label className="text-xs font-bold">Cidade<select aria-label="Cidade do evento" name="cidade" defaultValue={event?.cidade} className={input}>{CIDADES.map(c=><option key={c}>{c}</option>)}</select></label>
 <label className="text-xs font-bold">Data<input aria-label="Data do evento" name="data" type="date" required defaultValue={event?.data} className={input}/></label>
 <label className="text-xs font-bold">Local<input aria-label="Local do evento" name="local" required maxLength={300} defaultValue={event?.local} className={input}/></label>
 <label className="text-xs font-bold">Vagas<input aria-label="Vagas" name="vagas" type="number" min={Math.max(1,event?.inscritos??1)} max={100000} required defaultValue={event?.vagas} className={input}/></label>
 <label className="text-xs font-bold">Valor<input aria-label="Valor" name="valor" maxLength={100} defaultValue={event?.valor??'Gratuito'} className={input}/></label>
 <label className="text-xs font-bold md:col-span-2">Categorias<input aria-label="Categorias" name="categorias" placeholder="Separadas por vírgula" defaultValue={event?.categorias.join(', ')} className={input}/></label>
 <label className="text-xs font-bold md:col-span-2">Detalhes<textarea aria-label="Detalhes do evento" name="descricao" maxLength={5000} rows={3} defaultValue={event?.descricao} className={input}/></label>
 {message&&<p role="alert" className="text-sm md:col-span-2">{message}</p>}
 <div className="flex gap-3 md:col-span-2"><Button disabled={pending} type="submit">{pending?'Salvando…':event?'Salvar evento':'Publicar evento'}</Button><Button variant="ghost" type="button" onClick={onDone}>Cancelar</Button></div>
 </form>;
}
