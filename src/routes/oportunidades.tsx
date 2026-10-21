import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Plus, X, Megaphone } from 'lucide-react';
import { Shell, Chip, FadeIn } from '@/components/Shell';
import { Button } from '@/components/ui/button';
import { OportunidadeCard } from '@/components/OportunidadeCard';
import { OportunidadeForm } from '@/components/OportunidadeForm';
import { useStore } from '@/lib/store';
import { TIPOS_OPORTUNIDADE, type Oportunidade } from '@/lib/data';
import { platformQuery } from '@/lib/queries';
import { metadata, LoadError, Missing, SignInPrompt, EmptyState } from '@/components/RouteStates';

export const Route = createFileRoute('/oportunidades')({
  validateSearch: (s: Record<string, unknown>) => {
    const tipo = typeof s['tipo'] === 'string' ? s['tipo'] : undefined;
    return tipo ? { tipo } : {};
  },
  loader: async ({ context }) => { await context.queryClient.ensureQueryData(platformQuery); },
  errorComponent: LoadError,
  notFoundComponent: Missing,
  head: () => metadata('Oportunidades, editais e bolsas', 'Editais, bolsas-atleta e processos seletivos do esporte na Mata Sul de Pernambuco.'),
  component: Oportunidades,
});

function Oportunidades() {
  const { oportunidades, user } = useStore();
  const { tipo } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [form, setForm] = useState(false);
  const [editing, setEditing] = useState<Oportunidade | undefined>(undefined);
  const lista = tipo ? oportunidades.filter((o) => o.tipo === tipo) : oportunidades;
  const openEdit = (o: Oportunidade) => { setEditing(o); setForm(true); };
  const close = () => { setForm(false); setEditing(undefined); };
  return (
    <Shell>
      <div className="space-y-5 px-4 py-6 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold uppercase">Oportunidades</h1>
            <p className="mt-1 text-sm text-muted-foreground">Editais, bolsas-atleta e processos seletivos da região.</p>
          </div>
          {user ? <Button onClick={() => (form ? close() : setForm(true))}>{form ? <X /> : <Plus />}{form ? 'Fechar' : 'Publicar'}</Button> : <SignInPrompt />}
        </div>
        {form && user && <OportunidadeForm oportunidade={editing} onDone={close} />}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Chip active={!tipo} onClick={() => void navigate({ search: {} })}>Todas</Chip>
          {TIPOS_OPORTUNIDADE.map((t) => <Chip key={t} active={tipo === t} onClick={() => void navigate({ search: { tipo: t } })}>{t}</Chip>)}
        </div>
        <div className={`grid gap-4 ${lista.length >= 3 ? 'md:grid-cols-2 xl:grid-cols-3' : lista.length === 2 ? 'md:grid-cols-2' : ''}`}>
          {lista.map((o, i) => <FadeIn key={o.id} i={i}><OportunidadeCard o={o} onEdit={openEdit} /></FadeIn>)}
        </div>
        {!lista.length && (
          <EmptyState
            icon={Megaphone}
            title={tipo ? 'Nenhuma oportunidade desse tipo ainda.' : 'Nenhuma oportunidade publicada ainda.'}
            action={user ? <Button variant="outline" className="touch-control" onClick={() => setForm(true)}>Publicar oportunidade</Button> : undefined}
          />
        )}
      </div>
    </Shell>
  );
}
