import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flag,
  Clock,
  EyeOff,
  UserX,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { Shell } from '@/components/Shell';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { moderationQuery } from '@/lib/queries';
import { useActions } from '@/lib/store';
import { metadata, LoadError, Missing } from '@/components/RouteStates';

export const Route = createFileRoute('/admin')({
  loader: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(moderationQuery);
    } catch {
      // Caught gracefully by the component if unauthenticated or not staff
    }
  },
  errorComponent: LoadError,
  notFoundComponent: Missing,
  head: () => metadata('Painel de Moderação', 'Controle de segurança, denúncias e moderação de oportunidades.'),
  component: AdminModeration
});

function AdminModeration() {
  const { act, pending, user } = useActions();
  const query = useSuspenseQuery(moderationQuery);
  const data = query.data;

  const [sanctionUserId, setSanctionUserId] = useState('');
  const [sanctionType, setSanctionType] = useState<'warning' | 'suspension' | 'ban'>('warning');
  const [sanctionReason, setSanctionReason] = useState('');
  const [sanctionDays, setSanctionDays] = useState(7);

  if (!user || !data?.isStaff) {
    return (
      <Shell>
        <div className="mx-auto max-w-md py-16 text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-2xl font-bold">Acesso Restrito</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Este painel é reservado exclusivamente para a equipe de moderação e administradores da Atletar.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Voltar ao Início</Link>
          </Button>
        </div>
      </Shell>
    );
  }

  const reports = data.reports;
  const pendingOpportunities = data.pendingOpportunities;
  const recentSanctions = data.recentSanctions;

  const handleReviewReport = async (report: any, status: 'analisado' | 'descartado', hideTarget: boolean) => {
    try {
      await act({
        kind: 'moderation.review_report',
        value: {
          report_id: report.id,
          status,
          hide_target: hideTarget,
          target_type: report.target_type,
          target_id: report.target_id
        }
      });
      toast.success(status === 'analisado' ? 'Denúncia resolvida e conteúdo moderado!' : 'Denúncia descartada.');
    } catch {
      toast.error('Erro ao processar moderação da denúncia.');
    }
  };

  const handleReviewOpportunity = async (oppId: string, status: 'aprovada' | 'rejeitada') => {
    try {
      await act({
        kind: 'moderation.review_opportunity',
        value: {
          opportunity_id: oppId,
          status
        }
      });
      toast.success(status === 'aprovada' ? 'Oportunidade aprovada e publicada!' : 'Oportunidade rejeitada.');
    } catch {
      toast.error('Erro ao avaliar oportunidade.');
    }
  };

  const handleApplySanction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sanctionUserId.trim() || !sanctionReason.trim()) {
      toast.error('Preencha o ID do usuário e a justificativa da sanção.');
      return;
    }

    try {
      await act({
        kind: 'moderation.apply_sanction',
        value: {
          user_id: sanctionUserId.trim(),
          sanction_type: sanctionType,
          reason: sanctionReason.trim(),
          duration_days: sanctionType === 'suspension' ? sanctionDays : undefined
        }
      });
      toast.success(`Sanção (${sanctionType}) aplicada com sucesso!`);
      setSanctionUserId('');
      setSanctionReason('');
    } catch {
      toast.error('Não foi possível aplicar a sanção. Verifique os dados.');
    }
  };

  return (
    <Shell>
      <div className="space-y-6 px-4 py-6 md:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-extrabold uppercase">Painel de Moderação</h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Gestão de denúncias, aprovação de editais/bolsas e aplicação de sanções a infratores.
            </p>
          </div>
          <span className="rounded-sm bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary border border-primary/20">
            Staff Oficial Atletar
          </span>
        </header>

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="reports" className="relative">
              Denúncias
              {reports.length > 0 && (
                <span className="ml-1.5 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground">
                  {reports.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="relative">
              Oportunidades
              {pendingOpportunities.length > 0 && (
                <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                  {pendingOpportunities.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="sanctions">Sanções</TabsTrigger>
          </TabsList>

          {/* ABA 1: DENÚNCIAS PENDENTES */}
          <TabsContent value="reports" className="space-y-4">
            <h2 className="text-lg font-bold">Fila de Denúncias ({reports.length})</h2>
            {reports.length === 0 ? (
              <div className="rounded-sm border border-dashed p-8 text-center text-sm text-muted-foreground">
                <CheckCircle2 className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                Nenhuma denúncia pendente. A comunidade Atletar está segura e moderada!
              </div>
            ) : (
              <div className="grid gap-4">
                {reports.map((r: any) => (
                  <div key={r.id} className="rounded-touch border bg-card p-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded-sm bg-destructive/10 px-2.5 py-0.5 text-xs font-bold text-destructive uppercase">
                          Alvo: {r.target_type}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(r.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">ID: {r.target_id.slice(0, 8)}...</span>
                    </div>

                    <div className="rounded-sm bg-muted p-3 text-sm">
                      <p className="font-semibold text-xs text-muted-foreground mb-1 uppercase">Motivo relatado:</p>
                      <p className="leading-relaxed">{r.reason}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={pending}
                        onClick={() => handleReviewReport(r, 'descartado', false)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Descartar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={pending}
                        onClick={() => handleReviewReport(r, 'analisado', true)}
                      >
                        <EyeOff className="h-4 w-4 mr-1" />
                        Ocultar Conteúdo e Resolver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ABA 2: OPORTUNIDADES PENDENTES */}
          <TabsContent value="opportunities" className="space-y-4">
            <h2 className="text-lg font-bold">Oportunidades Aguardando Aprovação ({pendingOpportunities.length})</h2>
            {pendingOpportunities.length === 0 ? (
              <div className="rounded-sm border border-dashed p-8 text-center text-sm text-muted-foreground">
                <CheckCircle2 className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                Nenhum edital ou oportunidade pendente de revisão no momento.
              </div>
            ) : (
              <div className="grid gap-4">
                {pendingOpportunities.map((o: any) => (
                  <div key={o.id} className="rounded-touch border bg-card p-5 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <span className="rounded-sm bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary uppercase">
                          {o.tipo}
                        </span>
                        <h3 className="mt-1 text-xl font-bold">{o.titulo}</h3>
                        <p className="text-xs text-muted-foreground font-medium">{o.organizacao} · {o.cidade}</p>
                      </div>
                      {o.link && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={o.link} target="_blank" rel="noopener noreferrer">
                            Ver link externo <ExternalLink className="h-3.5 w-3.5 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>

                    {o.descricao && <p className="text-sm whitespace-pre-line text-muted-foreground">{o.descricao}</p>}

                    <div className="flex items-center justify-end gap-2 pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={pending}
                        onClick={() => handleReviewOpportunity(o.id, 'rejeitada')}
                      >
                        <XCircle className="h-4 w-4 mr-1 text-destructive" />
                        Rejeitar
                      </Button>
                      <Button
                        size="sm"
                        disabled={pending}
                        onClick={() => handleReviewOpportunity(o.id, 'aprovada')}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Aprovar e Divulgar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ABA 3: APLICAÇÃO DE SANÇÕES */}
          <TabsContent value="sanctions" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <form onSubmit={handleApplySanction} className="rounded-touch border bg-card p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <UserX className="h-5 w-5 text-destructive" />
                  <h3 className="text-lg font-bold">Aplicar Sanção a Usuário</h3>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold">UUID do Usuário</label>
                  <input
                    type="text"
                    required
                    placeholder="Cole o UUID do infrator..."
                    value={sanctionUserId}
                    onChange={(e) => setSanctionUserId(e.target.value)}
                    className="w-full rounded-sm border bg-background px-3 py-2 text-sm font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold">Tipo de Sanção</label>
                  <select
                    value={sanctionType}
                    onChange={(e) => setSanctionType(e.target.value as any)}
                    className="w-full rounded-sm border bg-background px-3 py-2 text-sm"
                  >
                    <option value="warning">Advertência (Apenas aviso formal)</option>
                    <option value="suspension">Suspensão Temporária (Bloqueia ações)</option>
                    <option value="ban">Banimento Definitivo (Bloqueio total)</option>
                  </select>
                </div>

                {sanctionType === 'suspension' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold">Duração da Suspensão (Dias)</label>
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={sanctionDays}
                      onChange={(e) => setSanctionDays(Number(e.target.value))}
                      className="w-full rounded-sm border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold">Justificativa da Sanção</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Descreva a infração às diretrizes da comunidade..."
                    value={sanctionReason}
                    onChange={(e) => setSanctionReason(e.target.value)}
                    className="w-full rounded-sm border bg-background px-3 py-2 text-sm resize-none"
                  />
                </div>

                <Button type="submit" variant="destructive" disabled={pending} className="w-full">
                  Aplicar Sanção no Banco
                </Button>
              </form>

              <div className="rounded-touch border bg-card p-5 space-y-4">
                <h3 className="text-lg font-bold">Sanções Recentes</h3>
                {recentSanctions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma sanção registrada recentemente.</p>
                ) : (
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {recentSanctions.map((s: any) => (
                      <div key={s.id} className="rounded-sm border p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold uppercase ${s.sanction_type === 'ban' ? 'text-destructive' : 'text-amber-500'}`}>
                            {s.sanction_type}
                          </span>
                          <span className="text-muted-foreground">{new Date(s.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <p className="font-mono text-muted-foreground">Usuário: {s.user_id.slice(0, 10)}...</p>
                        <p className="leading-snug">{s.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  );
}
