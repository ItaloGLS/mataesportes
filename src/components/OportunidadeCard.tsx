import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { BadgeCheck, ExternalLink, MapPin, MoreVertical, Pencil, Trash2, Flag } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useActions } from '@/lib/store';
import { formatData, type Oportunidade } from '@/lib/data';
import { ReportModal } from './ReportModal';

const selo: Record<Oportunidade['tipo'], string> = {
  'Edital': 'bg-primary text-accent',
  'Bolsa': 'bg-accent text-accent-foreground',
  'Processo seletivo': 'bg-secondary text-secondary-foreground',
};

export function OportunidadeCard({ o, onEdit }: { o: Oportunidade; onEdit?: (o: Oportunidade) => void }) {
  const { user, act } = useActions();
  const [reporting, setReporting] = useState(false);
  const mine = user?.id === o.autor;
  const encerrada = o.prazo ? Date.parse(o.prazo + 'T23:59:59') < Date.now() : false;
  const dias = o.prazo ? Math.ceil((Date.parse(o.prazo + 'T23:59:59') - Date.now()) / 86400000) : null;
  const oficial = Boolean(o.link);
  return (
    <article className="flex h-full flex-col gap-3 rounded-touch border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-sm px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${selo[o.tipo]}`}>{o.tipo}</span>
          {oficial && <span className="flex items-center gap-1 rounded-sm bg-secondary px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-secondary-foreground"><BadgeCheck className="h-3.5 w-3.5" />Fonte oficial</span>}
          {encerrada && <span className="rounded-sm bg-muted px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Encerrada</span>}
        </div>
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Opções da oportunidade" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {mine ? (
                <>
                  <DropdownMenuItem onClick={() => onEdit?.(o)}><Pencil className="h-4 w-4" />Editar</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => void act({ kind: 'opportunity.delete', id: o.id })}><Trash2 className="h-4 w-4" />Excluir</DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={() => setReporting(true)} className="text-destructive focus:text-destructive">
                  <Flag className="h-4 w-4" />Denunciar oportunidade
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <div>
        <h3 className="font-display text-2xl font-bold leading-tight">{o.titulo}</h3>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">{o.organizacao}</p>
      </div>
      {o.descricao && <p className="whitespace-pre-line text-sm leading-relaxed">{o.descricao}</p>}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{o.cidade}</span>
        {o.modalidade && <span>{o.modalidade}</span>}
      </div>
      {o.prazo && !encerrada && dias !== null && (
        <div>
          <p className="font-display text-2xl font-bold">{dias <= 0 ? 'Último dia' : dias === 1 ? 'Falta 1 dia' : `Faltam ${dias} dias`}</p>
          <p className="text-xs text-muted-foreground">Prazo: {new Date(o.prazo + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
      )}
      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        {o.autorNome && !oficial && <Link to="/perfil/$id" params={{ id: o.autor }} className="text-xs font-semibold text-muted-foreground hover:text-foreground">Publicado por {o.autorNome}</Link>}
        {o.link && <Button variant="outline" size="sm" asChild className="ml-auto"><a href={o.link} target="_blank" rel="noopener noreferrer">Ver edital<ExternalLink className="h-4 w-4" /></a></Button>}
      </div>
      <ReportModal isOpen={reporting} onClose={() => setReporting(false)} targetType="opportunity" targetId={o.id} targetTitle={o.titulo} />
    </article>
  );
}
