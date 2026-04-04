import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Skeleton from '../../components/ui/Skeleton';
import { api } from '../../services/api';

function PlanLabel({ plan }: { plan?: string }) {
  const label = plan === 'PRO' ? 'PRO' : plan === 'BUSINESS' ? 'BUSINESS' : 'FREE';
  return <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{label}</span>;
}

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api('/dashboard').then(setData).catch((e: any) => setErr(e.message || 'Erro ao carregar home.')).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {err && <Alert type="error">{err}</Alert>}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_260px]">
        <Card className="overflow-hidden p-0">
          <div className="p-8">
            <h1 className="text-[46px] font-extrabold tracking-tight text-slate-900 dark:text-white">Bem-vindo ao NexStock!</h1>
            <p className="mt-3 max-w-2xl text-xl leading-8 text-slate-600 dark:text-slate-300">
              Gerencie seu estoque e controle suas finanças de forma simplificada, responsiva e inteligente.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/app/stock/products"><Button>Adicionar Produto</Button></Link>
              <Link to="/app/stock/move"><Button variant="soft">Movimentar estoque</Button></Link>
            </div>
          </div>

          <div className="grid gap-4 border-t border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/40 md:grid-cols-2 2xl:grid-cols-4">
            <FeatureCard title="Gerencie seu Estoque" text="Cadastre, edite e arquive produtos do seu estoque." link="/app/stock/products" cta="Ver produtos" icon="📦" />
            <FeatureCard title="Controle as Movimentações" text="Registre entradas e saídas com histórico organizado." link="/app/stock/move" cta="Movimentar estoque" icon="🔄" />
            <FeatureCard title="Monitore suas Finanças" text="Veja as transações financeiras e acompanhe saldos." link="/app/finance/transactions" cta="Ver transações" icon="⚡" />
            <FeatureCard title="Importe Dados do Excel" text="Importe uma planilha para adicionar vários produtos." link="/app/import/products" cta="Importar dados" icon="📄" />
          </div>
        </Card>

        <Card className="flex h-full flex-col justify-between">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <>
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Seu Plano Atual</div>
                <div className="mt-4 text-4xl font-extrabold text-slate-900 dark:text-white">
                  {data?.plan === 'PRO' ? 'Profissional' : data?.plan === 'BUSINESS' ? 'Business' : 'Gratuito'}
                </div>
                <div className="mt-3"><PlanLabel plan={data?.plan} /></div>
                <p className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {data?.plan === 'PRO'
                    ? 'Plano profissional com funções financeiras e métricas avançadas.'
                    : data?.plan === 'BUSINESS'
                      ? 'Plano business com equipe, colaboração e escalabilidade.'
                      : 'Plano gratuito com funções básicas e limites iniciais.'}
                </p>
              </div>
              <Link to="/app/billing" className="mt-6">
                <Button className="w-full">Ver planos</Button>
              </Link>
            </>
          )}
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_280px]">
        <Card title="Últimos Produtos" subtitle="Adicionados recentemente">
          {loading ? <ListSkeleton /> : (
            <div className="space-y-3">
              {(data?.recentProducts || []).slice(0, 5).map((item: any) => (
                <div key={item.id} className="surface-soft flex items-center justify-between rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-100 text-lg dark:bg-sky-500/10">📦</div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{item.sku || 'Sem SKU'}</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.sku || 'Produto ativo'}</div>
                </div>
              ))}
              {!data?.recentProducts?.length && <div className="text-sm text-slate-500 dark:text-slate-400">Nenhum produto ainda.</div>}
            </div>
          )}
        </Card>

        <Card title="Últimos Movs" subtitle="Movimentações recentes">
          {loading ? <ListSkeleton /> : (
            <>
              <div className="space-y-3">
                {(data?.recentMoves || []).slice(0, 5).map((item: any) => (
                  <div key={item.id} className="surface-soft flex items-center justify-between rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{item.type === 'IN' ? 'Entrada' : item.type}</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{item.productName || item.name || 'Movimentação'}</span>
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">Hoje</span>
                  </div>
                ))}
                {!data?.recentMoves?.length && <div className="text-sm text-slate-500 dark:text-slate-400">Sem movimentações recentes.</div>}
              </div>
              <Link to="/app/stock/move" className="mt-5 inline-block text-sm font-semibold text-emerald-700 dark:text-emerald-300">Histórico completo →</Link>
            </>
          )}
        </Card>

        <Card title="Resumo">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              <Stat label="Produtos" value={data?.kpis?.products ?? 0} />
              <Stat label="Movs" value={data?.kpis?.moves ?? 0} />
              <Stat label="Transações" value={data?.kpis?.transactions ?? 0} />
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}

function FeatureCard({ title, text, cta, link, icon }: any) {
  return (
    <Link to={link} className="surface premium-hover rounded-[24px] p-5">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-2xl dark:bg-emerald-500/10">{icon}</div>
      <div className="mt-4 text-[22px] font-bold leading-[1.15] tracking-[-0.01em] text-slate-900 dark:text-white lg:text-[24px]">{title}</div>
      <div className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</div>
      <div className="mt-4 text-sm font-semibold text-emerald-700 dark:text-emerald-300">{cta} →</div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface-soft rounded-2xl px-4 py-4">
      <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
          <Skeleton className="h-11 w-11 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
