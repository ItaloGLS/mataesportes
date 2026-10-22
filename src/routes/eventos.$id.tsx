import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, Users, Trophy, Pencil, Trash2, MoreVertical } from 'lucide-react';
import { Shell, Avatar } from '@/components/Shell';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EventForm } from '@/components/EventForm';
import { useActions, useRegistrations } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { eventQuery } from '@/lib/queries';
import { formatData, marcaLabel, participanteLabel } from '@/lib/data';
import { metadata, LoadError, Missing, SignInPrompt, EmptyState } from '@/components/RouteStates';

export const Route = createFileRoute('/eventos/$id')({
  loader: async ({ context, params }) => { await context.queryClient.ensureQueryData(eventQuery(params.id)); },
  errorComponent: LoadError,
  notFoundComponent: Missing,
  head: () => metadata('Detalhes do evento', 'Categorias, local, vagas e inscrição no evento esportivo.'),
  component: Detalhe,
});

function Detalhe() {
  const { id } = Route.useParams();
  const navigate = Route.useNavigate();
  const { user, act, pending } = useActions();
  const inscricoes = useRegistrations();
  const { data: detail } = useSuspenseQuery(eventQuery(id));
  const [editing, setEditing] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const e = detail?.evento;
  const owner = Boolean(e && user?.id === e.organizador);
  const participants = useQuery({
    queryKey: ['participantes', id, user?.id],
    enabled: owner && participantsOpen,
    queryFn: async () => {
      const rows: { user_id: string; created_at: string; profiles: { nome: string } | null }[] = [];
      for (let start = 0; ; start += 500) {
        const { data, error } = await supabase.from('inscricoes').select('user_id,created_at,profiles!inscricoes_user_id_fkey(nome)').eq('evento_id', id).order('created_at').range(start, start + 499);
        if (error) throw error;
        rows.push(...(data ?? []));
        if ((data?.length ?? 0) < 500) return rows;
      }
    },
  });
  if (!e) return <Shell><p className="p-8">Evento não encontrado.</p></Shell>;
  const org = detail.organizador;
  const registered = inscricoes.has(id);
  const inscrever = (eventId: string) => act({ kind: 'registration', id: eventId, active: !registered });
  const closed = e.encerrado || e.data < new Date().toLocaleDateString('en-CA');
  const ranking = [...e.resultado].sort((a, b) => a.posicao - b.posicao);
  const [dia, mes] = formatData(e.data).split(' de ');
  const pct = e.vagas > 0 ? Math.min(100, Math.round((e.inscritos / e.vagas) * 100)) : 0;
  const dados = [
    { label: 'Data', valor: new Date(e.data + 'T12:00:00').toLocaleDateString('pt-BR') },
    { label: 'Horário', valor: e.horario || 'A definir' },
    { label: 'Local', valor: `${e.local}, ${e.cidade}` },
    { label: 'Vagas', valor: String(e.vagas) },
    { label: 'Valor', valor: e.valor },
  ];

  return (
    <Shell>
      <div className="space-y-6 px-4 py-6 md:px-8">
        <Link to="/eventos" className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground transition hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" />Eventos</Link>

        <section className="rounded-[20px] bg-card p-6 md:p-8">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-sm bg-primary py-4 text-primary-foreground">
              <span className="font-display text-4xl font-extrabold leading-none text-accent">{dia}</span>
              <span className="text-xs uppercase">{mes?.replace('.', '')}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-2"><span className="rounded-sm bg-primary px-2 py-1 text-[10px] font-bold uppercase text-primary-foreground">{e.modalidade}</span>{closed ? <span className="rounded-sm bg-muted px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground">Encerrado</span> : <span className="rounded-sm bg-seal px-2 py-1 text-[10px] font-bold uppercase text-seal-foreground">Inscrições abertas</span>}</div>
              <h1 className="mt-2 text-4xl font-extrabold uppercase leading-tight">{e.nome}</h1>
            </div>
            {owner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Opções do evento" title="Opções do evento"><MoreVertical /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditing(true)}><Pencil className="h-4 w-4" />Editar</DropdownMenuItem>
                  <DropdownMenuItem disabled={pending} className="text-destructive focus:text-destructive" onClick={async () => { if (!window.confirm('Excluir evento e suas inscrições?')) return; try { await act({ kind: 'event.delete', id }); await navigate({ to: '/eventos' }); } catch { setMessage('Não foi possível excluir.'); } }}><Trash2 className="h-4 w-4" />Excluir</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
            {dados.map((d) => (
              <div key={d.label}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{d.label}</p>
                <p className="mt-1 font-display text-xl font-bold leading-tight">{d.valor}</p>
              </div>
            ))}
          </div>
        </section>

        {editing && <EventForm event={e} onDone={() => setEditing(false)} />}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {e.encerrado && (
              <section className="rounded-[20px] bg-card p-6">
                <h2 className="flex items-center gap-2 text-2xl font-bold uppercase"><Trophy className="h-5 w-5 text-accent" />Resultado final</h2>
                {ranking.length ? (
                  <ol className="mt-4 divide-y">
                    <li className="grid grid-cols-[48px_1fr_auto] gap-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"><span>Pos.</span><span>{participanteLabel(e.modalidade)}</span><span>{marcaLabel(e.modalidade)}</span></li>
                    {ranking.map((r, i) => (
                      <li key={i} className="grid grid-cols-[48px_1fr_auto] items-center gap-3 py-3">
                        <span className={`flex h-9 w-9 items-center justify-center rounded-sm font-display text-xl font-extrabold ${r.posicao === 1 ? 'bg-accent text-accent-foreground' : 'bg-secondary'}`}>{r.posicao}º</span>
                        <span className="font-bold">{r.nome}</span>
                        <span className="font-display text-xl font-bold">{r.marca || '—'}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="mt-4"><EmptyState icon={Trophy} title={owner ? 'Adicione as colocações em Editar.' : 'Resultado ainda não divulgado.'} action={owner ? <Button variant="outline" className="touch-control" onClick={() => setEditing(true)}>Lançar resultado</Button> : undefined} /></div>
                )}
              </section>
            )}
            <section className="rounded-[20px] bg-card p-6">
              <h2 className="text-2xl font-bold uppercase">Sobre a prova</h2>
              {e.descricao ? (
                <p className="mt-4 whitespace-pre-wrap leading-relaxed">{e.descricao}</p>
              ) : (
                <div className="mt-4"><EmptyState icon={CalendarDays} title={owner ? 'Conte os detalhes da prova.' : 'Sem descrição adicional.'} action={owner ? <Button variant="outline" className="touch-control" onClick={() => setEditing(true)}>Adicionar descrição</Button> : undefined} /></div>
              )}
              {e.categorias.length > 0 && (
                <div className="mt-5">
                  <h3 className="text-xl font-bold uppercase">Categorias</h3>
                  <div className="mt-3 flex flex-wrap gap-2">{e.categorias.map((c) => <span key={c} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold">{c}</span>)}</div>
                </div>
              )}
            </section>

            {owner && (
              <section className="rounded-[20px] bg-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-2xl font-bold uppercase">Participantes</h2>
                  <Button variant="outline" onClick={() => setParticipantsOpen(!participantsOpen)} aria-expanded={participantsOpen}>{participantsOpen ? 'Ocultar' : `Ver (${e.inscritos})`}</Button>
                </div>
                {participantsOpen && (participants.isPending ? (
                  <p className="mt-4 text-sm text-muted-foreground">Carregando participantes…</p>
                ) : participants.isError ? (
                  <p role="alert" className="mt-4 text-sm">Não foi possível carregar participantes.</p>
                ) : participants.data?.length ? (
                  <ul className="mt-4 space-y-2">{participants.data.map((p) => <li key={p.user_id}><Link className="font-semibold hover:underline" to="/perfil/$id" params={{ id: p.user_id }}>{p.profiles?.nome ?? 'Participante'}</Link></li>)}</ul>
                ) : (
                  <div className="mt-4"><EmptyState icon={Users} title="Seja o primeiro a se inscrever." /></div>
                ))}
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <section className="rounded-[20px] bg-card p-6">
              <p className="font-display text-4xl font-extrabold uppercase">{e.valor}</p>
              <div className="mt-4">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-border"><div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} /></div>
                <p className="mt-1.5 text-xs text-muted-foreground"><span className="font-display text-lg font-semibold text-foreground">{e.inscritos}</span> / {e.vagas} vagas</p>
              </div>
              <div className="mt-5">
                {user ? (
                  <Button
                    className={registered ? 'w-full' : 'w-full bg-accent font-bold text-accent-foreground hover:bg-accent/80'}
                    variant={registered ? 'outline' : 'default'}
                    disabled={pending || (!registered && (closed || e.inscritos >= e.vagas))}
                    onClick={async () => { setMessage(''); try { await inscrever(id); setMessage(registered ? 'Inscrição cancelada.' : 'Inscrição confirmada.'); } catch { setMessage('Não foi possível inscrever: confira as vagas e a data do evento.'); } }}
                  >
                    {pending ? 'Aguarde…' : registered ? 'Cancelar inscrição' : closed ? 'Evento encerrado' : e.inscritos >= e.vagas ? 'Vagas esgotadas' : 'Inscrever-se'}
                  </Button>
                ) : <SignInPrompt />}
              </div>
              {message && <p role="status" className="mt-3 text-sm">{message}</p>}
              {org && (
                <Link to="/perfil/$id" params={{ id: org.id }} className="mt-5 flex items-center gap-3 border-t pt-4">
                  <Avatar iniciais={org.iniciais} src={org.avatarUrl} />
                  <div><p className="text-xs text-muted-foreground">Organização</p><p className="font-bold">{org.nome}</p></div>
                </Link>
              )}
            </section>
          </aside>
        </div>
      </div>
    </Shell>
  );
}
