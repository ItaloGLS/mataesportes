import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { CIDADES, MODALIDADES, TIPOS_OPORTUNIDADE, type Oportunidade } from '@/lib/data';
import { useActions } from '@/lib/store';

const input = 'mt-1 w-full rounded-sm border bg-card px-3 py-2 text-sm';

export function OportunidadeForm({ oportunidade, onDone }: { oportunidade?: Oportunidade | undefined; onDone: () => void }) {
  const { act, pending } = useActions();
  const [message, setMessage] = useState('');
  return (
    <form className="grid gap-4 rounded-touch border bg-card p-5 md:grid-cols-2" onSubmit={async (e) => {
      e.preventDefault();
      const f = new FormData(e.currentTarget);
      const value = {
        tipo: String(f.get('tipo')) as Oportunidade['tipo'],
        titulo: String(f.get('titulo')),
        organizacao: String(f.get('organizacao')),
        descricao: String(f.get('descricao')),
        cidade: String(f.get('cidade')),
        modalidade: String(f.get('modalidade')),
        link: String(f.get('link')),
        prazo: String(f.get('prazo')),
      };
      try {
        await act(oportunidade ? { kind: 'opportunity.update', id: oportunidade.id, value } : { kind: 'opportunity.create', value });
        toast.success(oportunidade ? 'Oportunidade atualizada!' : 'Oportunidade enviada para aprovação da moderação!');
        onDone();
      } catch { setMessage('Não foi possível salvar. Confira os campos e tente novamente.'); }
    }}>
      <div className="md:col-span-2 rounded-sm border border-seal/30 bg-seal/5 p-3 text-xs text-muted-foreground flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-seal shrink-0" />
        <span>Para proteção dos atletas e combate a golpes, as publicações de oportunidades são verificadas pela moderação antes de ficarem públicas.</span>
      </div>
      <label className="text-xs font-bold">Tipo
        <select aria-label="Tipo de oportunidade" name="tipo" defaultValue={oportunidade?.tipo} className={input}>
          {TIPOS_OPORTUNIDADE.map((t) => <option key={t}>{t}</option>)}
        </select>
      </label>
      <label className="text-xs font-bold">Título
        <input aria-label="Título da oportunidade" name="titulo" required minLength={3} maxLength={200} defaultValue={oportunidade?.titulo} placeholder="Ex.: Bolsa-atleta municipal 2026" className={input} />
      </label>
      <label className="text-xs font-bold">Organização
        <input aria-label="Organização responsável" name="organizacao" required maxLength={200} defaultValue={oportunidade?.organizacao} placeholder="Prefeitura, clube, liga…" className={input} />
      </label>
      <label className="text-xs font-bold">Cidade
        <select aria-label="Cidade da oportunidade" name="cidade" defaultValue={oportunidade?.cidade} className={input}>
          {CIDADES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      <label className="text-xs font-bold">Modalidade
        <select aria-label="Modalidade da oportunidade" name="modalidade" defaultValue={oportunidade?.modalidade ?? ''} className={input}>
          <option value="">Todas</option>
          {MODALIDADES.map((m) => <option key={m}>{m}</option>)}
        </select>
      </label>
      <label className="text-xs font-bold">Prazo de inscrição
        <input aria-label="Prazo de inscrição" name="prazo" type="date" defaultValue={oportunidade?.prazo ?? ''} className={input} />
      </label>
      <label className="text-xs font-bold md:col-span-2">Link oficial
        <input aria-label="Link oficial" name="link" type="url" maxLength={500} defaultValue={oportunidade?.link} placeholder="https://…" className={input} />
      </label>
      <label className="text-xs font-bold md:col-span-2">Detalhes
        <textarea aria-label="Detalhes da oportunidade" name="descricao" maxLength={5000} rows={3} defaultValue={oportunidade?.descricao} placeholder="Requisitos, valores, documentos necessários…" className={input} />
      </label>
      {message && <p role="alert" className="text-sm md:col-span-2">{message}</p>}
      <div className="flex gap-3 md:col-span-2">
        <Button disabled={pending} type="submit">{pending ? 'Salvando…' : oportunidade ? 'Salvar' : 'Publicar'}</Button>
        <Button variant="ghost" type="button" onClick={onDone}>Cancelar</Button>
      </div>
    </form>
  );
}
