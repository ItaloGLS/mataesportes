import { createFileRoute, Link } from '@tanstack/react-router';
import { ShieldCheck, Lock, Users, HeartHandshake, FileText, ArrowLeft } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { metadata } from '@/components/RouteStates';

export const Route = createFileRoute('/termos')({
  head: () => metadata('Termos, Privacidade e Segurança', 'Diretrizes legais, política de privacidade, LGPD e proteção de menores da Atletar.'),
  component: TermosPage
});

function TermosPage() {
  return (
    <Shell>
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 md:px-6">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 text-muted-foreground">
            <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" />Voltar ao início</Link>
          </Button>
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="h-7 w-7" />
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Termos, Privacidade & Segurança
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            A <strong>Atletar</strong> é uma plataforma dedicada a impulsionar o talento esportivo de forma segura, ética e transparente. Aqui você encontra nossos compromissos legais, em conformidade com o Marco Civil da Internet, a LGPD e o Estatuto da Criança e do Adolescente (ECA).
          </p>
        </div>

        <Tabs defaultValue="termos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1 bg-muted/60">
            <TabsTrigger value="termos" className="py-2.5 text-xs md:text-sm font-semibold gap-1.5">
              <FileText className="h-4 w-4" />Termos de Uso
            </TabsTrigger>
            <TabsTrigger value="privacidade" className="py-2.5 text-xs md:text-sm font-semibold gap-1.5">
              <Lock className="h-4 w-4" />Privacidade & LGPD
            </TabsTrigger>
            <TabsTrigger value="menores" className="py-2.5 text-xs md:text-sm font-semibold gap-1.5">
              <ShieldCheck className="h-4 w-4" />Proteção a Menores
            </TabsTrigger>
            <TabsTrigger value="comunidade" className="py-2.5 text-xs md:text-sm font-semibold gap-1.5">
              <Users className="h-4 w-4" />Diretrizes
            </TabsTrigger>
          </TabsList>

          {/* 1. TERMOS DE USO */}
          <TabsContent value="termos" className="rounded-touch border bg-card p-6 md:p-8 space-y-6 text-sm leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-xl font-bold">1. Objeto e Aceitação</h2>
              <p className="text-muted-foreground">
                Ao criar uma conta ou utilizar a plataforma Atletar, você declara ter lido, compreendido e concordado expressamente com estes Termos de Uso. A plataforma tem como finalidade conectar atletas, treinadores, olheiros e organizadores de eventos esportivos.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold">2. Cadastro e Veracidade das Informações</h2>
              <p className="text-muted-foreground">
                O usuário é o único responsável pela veracidade dos dados informados no perfil, marcas e pódios. É estritamente proibido criar perfis falsos, usurpar a identidade de terceiros ou se autodeclarar representante de clubes ou federações sem a devida comprovação. O selo de perfil verificado é de concessão exclusiva da administração.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold">3. Publicação de Editais e Oportunidades</h2>
              <p className="text-muted-foreground">
                Toda oportunidade, edital, bolsa ou peneira publicada por usuários comuns é submetida a moderação prévia. É proibido divulgar links suspeitos, promessas fraudulentas ou cobranças ilegais de valores para testes esportivos.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold">4. Sanções e Moderação</h2>
              <p className="text-muted-foreground">
                A moderação da Atletar reserva-se o direito de advertir, suspender temporariamente ou banir em definitivo qualquer usuário que viole as diretrizes da plataforma, com bloqueio técnico a nível de banco de dados.
              </p>
            </section>
          </TabsContent>

          {/* 2. PRIVACIDADE & LGPD */}
          <TabsContent value="privacidade" className="rounded-touch border bg-card p-6 md:p-8 space-y-6 text-sm leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-xl font-bold">1. Princípios e Coleta Mínima</h2>
              <p className="text-muted-foreground">
                Em respeito à Lei Geral de Proteção de Dados (Lei nº 13.709/2018), coletamos apenas os dados estritamente necessários para a execução dos serviços esportivos: nome, foto, cidade, modalidades, biografia, pódios e data de nascimento para classificação de faixa etária.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold">2. Isolamento de Dados Pessoais Sensíveis</h2>
              <p className="text-muted-foreground">
                A data de nascimento e o e-mail dos responsáveis legais são armazenados em tabela restrita e protegida por regras rígidas de segurança (RLS), não sendo visíveis publicamente por outros usuários ou visitantes anônimos.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold">3. Direitos do Titular de Dados</h2>
              <p className="text-muted-foreground">
                Você pode a qualquer momento solicitar a visualização, correção ou exclusão definitiva de sua conta e histórico de dados esportivos através do painel de perfil ou pelo canal de suporte oficial.
              </p>
            </section>
          </TabsContent>

          {/* 3. PROTEÇÃO A MENORES DE IDADE */}
          <TabsContent value="menores" className="rounded-touch border bg-card p-6 md:p-8 space-y-6 text-sm leading-relaxed">
            <div className="rounded-sm border border-seal/30 bg-seal/5 p-4 text-xs leading-relaxed flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-seal shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground text-sm">Prioridade Absoluta:</strong> A proteção integral da criança e do adolescente (Art. 227 da CF e Lei 8.069/1990 - ECA) é princípio inegociável na Atletar.
              </div>
            </div>

            <section className="space-y-2">
              <h2 className="text-xl font-bold">1. Blindagem de Menores de 18 Anos</h2>
              <p className="text-muted-foreground">
                Atletas menores de 18 anos possuem proteções ativas automáticas: sua cidade é ocultada nas consultas públicas, seu perfil não é exposto a contatos de olheiros sem supervisão, e fotos enviadas passam por validação antiabuso.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold">2. Consentimento Parental</h2>
              <p className="text-muted-foreground">
                O cadastro de jovens atletas exige declaração de ciência dos pais ou responsáveis legais, sendo disponibilizado campo para e-mail de contato do responsável para acompanhamento de atividades esportivas.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold">3. Canal Rápido de Denúncia</h2>
              <p className="text-muted-foreground">
                Qualquer interação suspeita, assédio ou tentativa de aliciamento de menores de idade conta com botão prioritário de denúncia em todos os posts, mensagens e perfis. Conteúdos denunciados por 3 membros distintos são ocultados automaticamente pelo sistema até análise do moderador.
              </p>
            </section>
          </TabsContent>

          {/* 4. DIRETRIZES DA COMUNIDADE */}
          <TabsContent value="comunidade" className="rounded-touch border bg-card p-6 md:p-8 space-y-6 text-sm leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-xl font-bold">1. Espírito Esportivo e Respeito Mútuo</h2>
              <p className="text-muted-foreground">
                A Atletar é uma comunidade voltada ao incentivo e valorização do esporte. Comentários desrespeitosos, ofensas pessoais, discriminação de qualquer natureza (racial, de gênero, religiosa ou regional) resultarão em expulsão imediata da rede.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold">2. Tolerância Zero a Golpes e Fraudes</h2>
              <p className="text-muted-foreground">
                É proibido vender vagas em peneiras, promover apostas ou rifas não autorizadas, ou cobrar taxas ocultas em nome de terceiros. Apenas eventos oficiais com organizadores identificados são tolerados.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold">3. Como Agir em Caso de Dúvida</h2>
              <p className="text-muted-foreground">
                Se você notar qualquer atitude em desacordo com nossas diretrizes, utilize o botão de denúncia presente em cada publicação ou perfil. Nossa equipe de moderação age prontamente para garantir um espaço seguro para todos.
              </p>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  );
}
