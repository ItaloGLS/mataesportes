import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Pencil, Trophy, Timer, MessageSquare, Flag } from 'lucide-react';
import { Shell, Avatar } from '@/components/Shell';
import { Button } from '@/components/ui/button';
import { FeedList } from '@/components/FeedList';
import { ProfileForm } from '@/components/ProfileForm';
import { useActions, useFollowing } from '@/lib/store';
import { feedQuery, profileQuery } from '@/lib/queries';
import { metadata, LoadError, Missing, SignInPrompt, EmptyState } from '@/components/RouteStates';
import { ReportModal } from '@/components/ReportModal';

export const Route = createFileRoute('/perfil/$id')({
  loader: async ({ context, params }) => { await Promise.all([context.queryClient.ensureQueryData(profileQuery(params.id)), context.queryClient.ensureInfiniteQueryData(feedQuery({ autor: params.id }))]); },
  errorComponent: LoadError,
  notFoundComponent: Missing,
  head: () => metadata('Currículo esportivo', 'Biografia, modalidades, pódios e marcas dos esportistas da Mata Sul.'),
  component: Perfil,
});

function Perfil() {
  const { id } = Route.useParams();
  const { user, act, pending } = useActions();
  const { data: u } = useSuspenseQuery(profileQuery(id));
  const [editing, setEditing] = useState(false);
  const [reporting, setReporting] = useState(false);
  const own = user?.id === id;
  const following = useFollowing(id, !own);
  if (!u) return <Shell><p className="p-8">Perfil não encontrado.</p></Shell>;
  const seguidores = u.seguidores;
  const seguindo = u.seguindo;
  const dados = [u.role, u.modalidades.slice(0, 2).join(' · ') || null, u.cidade ? `${u.cidade}, PE` : null].filter(Boolean).join(' · ');

  return (
    <Shell>
      <div className="space-y-7 px-4 py-6 md:px-8">
        <section className="space-y-5">
          <div className="relative h-24 overflow-hidden rounded-sm bg-primary md:h-28" aria-hidden><div className="absolute inset-y-0 right-0 w-1/3 bg-accent [clip-path:polygon(30%_0,100%_0,100%_100%,0_100%)]" /><div className="absolute inset-y-0 right-[30%] w-6 bg-accent/60 [clip-path:polygon(60%_0,100%_0,40%_100%,0_100%)]" /></div>
          <div className="flex flex-wrap items-start gap-4">
            <div className="-mt-12 md:-mt-14"><Avatar iniciais={u.iniciais} src={u.avatarUrl} size="lg" /></div>
            <div className="min-w-0 flex-1 pt-2">
              <h1 className="text-4xl font-extrabold">{u.nome}</h1>
              {dados && <p className="mt-1 font-display text-lg font-semibold uppercase tracking-wide text-muted-foreground">{dados}</p>}
            </div>
            {own ? (
              <Button variant="outline" onClick={() => setEditing(!editing)}><Pencil />{editing ? 'Fechar' : 'Editar perfil'}</Button>
            ) : user ? (
              <div className="flex items-center gap-2">
                <Button disabled={pending} variant={following ? 'outline' : 'default'} onClick={async () => { try { await act({ kind: 'follow', id, active: !following }); } catch { /* feedback is shown by the mutation */ } }}>{following ? 'Deixar de seguir' : 'Seguir'}</Button>
                <Button variant="ghost" size="icon" title="Denunciar perfil" aria-label="Denunciar perfil" onClick={() => setReporting(true)}>
                  <Flag className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            ) : <SignInPrompt />}
          </div>
          {u.bio && <p className="whitespace-pre-wrap leading-relaxed">{u.bio}</p>}
          
          <p className="flex gap-6 text-sm text-muted-foreground">
            <span><strong className="font-display text-2xl font-bold text-foreground">{seguidores}</strong> {seguidores === 1 ? 'seguidor' : 'seguidores'}</span>
            <span><strong className="font-display text-2xl font-bold text-foreground">{seguindo}</strong> seguindo</span>
          </p>
        </section>

        {own && editing && <ProfileForm profile={u} onDone={() => setEditing(false)} />}

        <div className="grid gap-7 lg:grid-cols-2">
          <section>
            <h2 className="flex items-center gap-2 text-2xl font-bold uppercase"><Trophy className="h-5 w-5" />Pódios</h2>
            {u.podios.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {u.podios.map((p, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center bg-accent font-display text-xl font-bold text-accent-foreground">{p.posicao}º</span>
                    <div><p className="font-semibold">{p.titulo}</p><p className="text-xs text-muted-foreground">{p.ano}</p></div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4"><EmptyState icon={Trophy} title={own ? 'Registre seu primeiro pódio.' : 'Nenhum pódio por aqui ainda.'} action={own ? <Button variant="outline" className="touch-control" onClick={() => setEditing(true)}>Registrar pódio</Button> : undefined} /></div>
            )}
          </section>
          <section>
            <h2 className="flex items-center gap-2 text-2xl font-bold uppercase"><Timer className="h-5 w-5" />Tempos e marcas</h2>
            {u.marcas.length > 0 ? (
              <dl className="mt-4 space-y-3">
                {u.marcas.map((m, i) => (
                  <div key={i} className="flex items-baseline justify-between gap-3 border-b pb-2">
                    <dt className="text-sm">{m.prova}</dt>
                    <dd className="font-display text-2xl font-bold">{m.valor}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <div className="mt-4"><EmptyState icon={Timer} title={own ? 'Anote sua primeira marca.' : 'Nenhuma marca registrada ainda.'} action={own ? <Button variant="outline" className="touch-control" onClick={() => setEditing(true)}>Registrar marca</Button> : undefined} /></div>
            )}
          </section>
        </div>

        <h2 className="text-2xl font-bold uppercase">Publicações</h2>
        <div><FeedList filter={{ autor: id }} empty={<EmptyState icon={MessageSquare} title={own ? 'Mostre seu treino pra região.' : 'Nenhuma publicação ainda.'} />} /></div>
      </div>
      <ReportModal isOpen={reporting} onClose={() => setReporting(false)} targetType="profile" targetId={id} targetTitle={u.nome} />
    </Shell>
  );
}
