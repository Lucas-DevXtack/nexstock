import { useEffect, useMemo, useState } from 'react';
import Alert from '../../components/ui/Alert';
import Skeleton from '../../components/ui/Skeleton';
import { api } from '../../services/api';

type DashboardPayload = {
  plan: string;
  flags?: Record<string, any>;
  kpis: {
    products: number;
    moves: number;
    transactions: number;
  };
};

function planLabel(plan?: string) {
  switch (String(plan || '').toUpperCase()) {
    case 'PRO':
      return 'Pro';
    case 'BUSINESS':
      return 'Business';
    default:
      return 'Gratuito';
  }
}

function StatCard({
  title,
  value,
  description,
  tone,
}: {
  title: string;
  value: number | string;
  description: string;
  tone: 'green' | 'blue' | 'amber';
}) {
  const tones = {
    green: 'bg-[#f7fbf8] text-[#2c6b58] border-[#e3eee8] dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/10',
    blue: 'bg-[#f7f9fc] text-[#4a77a8] border-[#e7edf5] dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/10',
    amber: 'bg-[#fcfaf4] text-[#b8871d] border-[#f4ecd5] dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/10',
  } as const;

  const icons = {
    green: '▣',
    blue: '↻',
    amber: '⚡',
  } as const;

  return (
    <div className="surface premium-hover rounded-[28px] p-6">
      <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border text-2xl ${tones[tone]}`}>
        {icons[tone]}
      </div>
      <div className="text-[18px] font-semibold leading-tight text-slate-900 dark:text-white">{title}</div>
      <div className="mt-1 text-[46px] font-bold leading-none tracking-[-0.03em] text-slate-900 dark:text-white">{value}</div>
      <div className="mt-3 text-[15px] leading-6 text-slate-500 dark:text-slate-400">{description}</div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const r = await api('/dashboard');
        setData(r);
      } catch (e: any) {
        setErr(e.message || 'Erro ao carregar dashboard.');
      }
    })();
  }, []);

  const plan = useMemo(() => String(data?.plan || 'FREE').toUpperCase(), [data?.plan]);
  const planText = planLabel(plan);
  const financeEnabled = Boolean(data?.flags?.financialModuleEnabled ?? data?.flags?.financeEnabled ?? true);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[54px] font-bold leading-none tracking-[-0.04em] text-slate-900 dark:text-white">Dashboard</h1>
        <p className="mt-4 text-[18px] text-slate-600 dark:text-slate-400">Visão geral do tenant.</p>
      </div>

      {err && <Alert type="error">{err}</Alert>}

      {!data ? (
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <Skeleton className="h-[320px] w-full rounded-[30px]" />
          <Skeleton className="h-[320px] w-full rounded-[30px]" />
        </div>
      ) : (
        <>
          <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="surface rounded-[30px] p-7">
              <div className="text-[18px] font-semibold text-slate-900 dark:text-white">Plano Atual</div>
              <div className="mt-6 text-[52px] font-bold leading-none tracking-[-0.04em] text-slate-900 dark:text-white">{planText}</div>
              <div className="mt-5 inline-flex items-center rounded-2xl bg-emerald-700 px-4 py-2 text-[14px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_12px_28px_-16px_rgba(6,95,70,0.9)]">
                {plan}
              </div>

              <div className="mt-10 text-[18px] font-semibold text-slate-900 dark:text-white">Flags</div>

              <div className="mt-5 rounded-[24px] bg-[#f8faf8] p-5 ring-1 ring-slate-100 dark:bg-slate-950/60 dark:ring-slate-800">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-lg text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    ✓
                  </div>
                  <div>
                    <div className="text-[16px] font-semibold text-slate-900 dark:text-white">Financeiro {financeEnabled ? 'Ativado' : 'Desativado'}</div>
                    <div className="mt-2 flex items-start gap-2 text-[15px] text-slate-500 dark:text-slate-400">
                      <span className="mt-[7px] text-[10px] text-emerald-600">▶</span>
                      <span>
                        {financeEnabled
                          ? 'Funções financeiras estão ativadas.'
                          : 'Funções financeiras estão desativadas para este tenant.'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="surface rounded-[30px] p-7">
              <div className="text-[18px] font-semibold text-slate-900 dark:text-white">KPIs</div>
              <div className="mt-7 grid gap-5 md:grid-cols-2">
                <div className="rounded-[24px] bg-[#f7f8fb] p-6 dark:bg-slate-950/60">
                  <div className="text-[18px] font-medium text-slate-700 dark:text-slate-300">Produtos</div>
                  <div className="mt-3 text-[58px] font-bold leading-none tracking-[-0.05em] text-slate-900 dark:text-white">{data.kpis.products}</div>
                  <div className="mt-4 max-w-[180px] text-[15px] leading-6 text-slate-500 dark:text-slate-400">produtos cadastrados</div>
                </div>
                <div className="rounded-[24px] bg-[#f7f8fb] p-6 dark:bg-slate-950/60">
                  <div className="text-[18px] font-medium text-slate-700 dark:text-slate-300">Movs</div>
                  <div className="mt-3 text-[58px] font-bold leading-none tracking-[-0.05em] text-slate-900 dark:text-white">{data.kpis.moves}</div>
                  <div className="mt-4 max-w-[180px] text-[15px] leading-6 text-slate-500 dark:text-slate-400">movimentações registradas</div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-5 text-[18px] font-semibold text-slate-900 dark:text-white">KPIs</div>
            <div className="grid gap-6 lg:grid-cols-3">
              <StatCard title="Produtos" value={data.kpis.products} description="produtos cadastrados" tone="green" />
              <StatCard title="Movs" value={data.kpis.moves} description="movimentações registradas" tone="blue" />
              <StatCard title="Transações" value={data.kpis.transactions} description="transações financeiras" tone="amber" />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
