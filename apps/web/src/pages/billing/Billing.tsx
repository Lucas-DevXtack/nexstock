import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { api } from '../../services/api';

const PLAN_PRICES: Record<'FREE'|'PRO'|'BUSINESS', string> = {
  FREE: 'Grátis',
  PRO: 'R$ 29,99/mês',
  BUSINESS: 'R$ 79,99/mês',
};

type Status = {
  provider?: 'MERCADO_PAGO' | null;
  plan: 'FREE'|'PRO'|'BUSINESS';
  effectivePlan: 'FREE'|'PRO'|'BUSINESS';
  billingStatus?: string|null;
  billingCurrentPeriodEnd?: string|null;
  billingTrialEndsAt?: string|null;
  billingCheckoutUrl?: string|null;
  requiresPaymentAction?: boolean;
  canStartTrial?: boolean;
  features?: {
    stock: boolean;
    finance: boolean;
    reports: boolean;
    team: boolean;
  };
};

function fmtDate(d?: string|null) {
  if (!d) return '—';
  try { return new Date(d).toLocaleString('pt-BR'); } catch { return d; }
}

function statusLabel(status?: string | null) {
  switch (String(status || '').toUpperCase()) {
    case 'ACTIVE': return 'Ativa';
    case 'TRIALING': return 'Trial';
    case 'PENDING': return 'Aguardando pagamento';
    case 'PAST_DUE': return 'Pagamento pendente';
    case 'CANCELED': return 'Cancelada';
    case 'EXPIRED': return 'Expirada';
    case 'INACTIVE': return 'Inativa';
    default: return status || '—';
  }
}

export default function Billing() {
  const [st, setSt] = useState<Status|null>(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setErr('');
    try {
      const r = await api('/billing/status');
      setSt(r);
    } catch (e: any) {
      setErr(e.message || 'Erro');
    }
  }

  useEffect(() => {
    const url = new URL(window.location.href);
    const hasSuccess = url.searchParams.get('success');
    const hasPending = url.searchParams.get('pending');
    const hasFailure = url.searchParams.get('failure');

    if (hasSuccess) setMsg('Pagamento concluído. Vamos reconciliar e atualizar seu plano automaticamente.');
    if (hasPending) setMsg('Pagamento criado. Conclua no Mercado Pago para liberar o plano.');
    if (hasFailure) setMsg('O pagamento não foi concluído. Você pode tentar novamente.');

    let cancelled = false;
    let timer: number | null = null;

    async function boot() {
      await refresh();

      if (hasSuccess || hasPending) {
        let attempts = 0;
        const tick = async () => {
          if (cancelled) return;
          attempts += 1;
          try {
            const r = await api('/billing/reconcile', { method: 'POST' });
            console.log('[billing.reconcile.response]', r);
            
            const next = await api('/billing/status');
            setSt(next);
            
            const billingStatus = String(next?.billingStatus || '').toUpperCase();
            const effectivePlan = String(next?.effectivePlan || '').toUpperCase();
            
            if (
              billingStatus === 'ACTIVE' ||
              billingStatus === 'TRIALING' ||
              effectivePlan === 'PRO' ||
              effectivePlan === 'BUSINESS'
            ) {
              setMsg('Plano atualizado com sucesso.');
              const clean = new URL(window.location.href);
              clean.searchParams.delete('success');
              clean.searchParams.delete('pending');
              clean.searchParams.delete('failure');
              window.history.replaceState({}, '', clean.toString());
              return;
            }

          } catch (e: any) {
            console.warn('[billing.reconcile.poll]', e);
          }

          if (attempts < 12 && !cancelled) {
            timer = window.setTimeout(tick, 5000);
          } else if (!cancelled) {
            setMsg('Pagamento recebido. Se o plano ainda não mudou, clique em Atualizar status em alguns segundos.');
          }
        };

        timer = window.setTimeout(tick, hasSuccess ? 1500 : 4000);
      }
    }

    void boot();

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  async function checkout(plan: 'PRO'|'BUSINESS') {
    setBusy(true);
    setErr('');
    try {
      const r = await api('/billing/checkout', { method: 'POST', body: JSON.stringify({ plan }) });
      window.location.href = r.url;
    } catch (e: any) {
      setErr(e.message || 'Erro');
      setBusy(false);
    }
  }

  async function startTrial() {
    setBusy(true);
    setErr('');
    try {
      await api('/billing/trial', { method: 'POST' });
      setMsg('Teste grátis do PRO ativado por 7 dias.');
      await refresh();
    } catch (e: any) {
      setErr(e.message || 'Erro');
    } finally {
      setBusy(false);
    }
  }

  async function cancelPlan() {
    setBusy(true);
    setErr('');
    try {
      await api('/billing/cancel', { method: 'POST' });
      setMsg('Plano pago cancelado e tenant rebaixado para FREE.');
      await refresh();
    } catch (e: any) {
      setErr(e.message || 'Erro');
    } finally {
      setBusy(false);
    }
  }

  const statusTone = useMemo(() => {
    const status = String(st?.billingStatus || '').toUpperCase();
    if (!status) return 'bg-slate-100 text-slate-700';
    if (status === 'ACTIVE' || status === 'TRIALING') return 'bg-emerald-100 text-emerald-700';
    if (status === 'PENDING' || status === 'PAST_DUE') return 'bg-amber-100 text-amber-800';
    if (status === 'CANCELED' || status === 'EXPIRED') return 'bg-rose-100 text-rose-700';
    return 'bg-slate-100 text-slate-700';
  }, [st?.billingStatus]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Plano e cobrança</h1>
        <p className="text-sm text-slate-500">Checkout via Mercado Pago com PIX e cartão, verificação por webhook e liberação automática do plano.</p>
      </div>

      {msg && <Alert type="info">{msg}</Alert>}
      {err && <Alert type="error">{err}</Alert>}
      {st?.requiresPaymentAction && (
        <Alert type="error">Seu plano pago está com pendência. Recursos PRO/BUSINESS ficam bloqueados até a regularização do pagamento.</Alert>
      )}

      {!st ? (
        <Card>Carregando…</Card>
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <Card title="Resumo da assinatura" subtitle="Estado atual do seu tenant">
              <div className="grid gap-4 md:grid-cols-2">
                <Info label="Provedor" value={st.provider || '—'} />
                <Info label="Plano contratado" value={st.plan} />
                <Info label="Plano efetivo" value={st.effectivePlan} />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</div>
                  <div className="mt-2">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusTone}`}>{statusLabel(st.billingStatus)}</span>
                  </div>
                </div>
                <Info label="Fim do ciclo" value={fmtDate(st.billingCurrentPeriodEnd)} />
                <Info label="Fim do trial" value={fmtDate(st.billingTrialEndsAt)} />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button variant="ghost" onClick={refresh} disabled={busy}>Atualizar status</Button>
                {st.plan !== 'FREE' && <Button variant="danger" onClick={cancelPlan} disabled={busy}>Cancelar e voltar ao FREE</Button>}
              </div>
            </Card>

            <Card title="Recursos liberados" subtitle="O backend usa este estado para decidir acessos">
              <div className="grid gap-3 sm:grid-cols-2">
                <FeaturePill label="Estoque" enabled={!!st.features?.stock} />
                <FeaturePill label="Financeiro" enabled={!!st.features?.finance} />
                <FeaturePill label="Relatórios" enabled={!!st.features?.reports} />
                <FeaturePill label="Equipe" enabled={!!st.features?.team} />
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                PRO e BUSINESS só funcionam com cobrança <b>ativa</b> ou em <b>trial</b>. Se o ciclo expirar ou o pagamento falhar, o backend rebaixa automaticamente o acesso efetivo.
              </div>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <PlanCard
              title="FREE"
              price={PLAN_PRICES.FREE}
              active={st.plan === 'FREE'}
              items={['Até 20 produtos ativos', 'Operação básica de estoque', 'Sem financeiro avançado']}
              actionLabel={st.plan === 'FREE' ? 'Plano atual' : 'Voltar para FREE'}
              onAction={st.plan === 'FREE' ? undefined : cancelPlan}
              busy={busy}
            />

            <PlanCard
              title="PRO"
              price={PLAN_PRICES.PRO}
              active={st.plan === 'PRO'}
              items={['Até 500 produtos ativos', 'Financeiro habilitado', 'KPIs e relatórios avançados', '7 dias de teste grátis (uma vez)']}
              actionLabel={st.plan === 'PRO' ? 'Gerar novo link PRO' : 'Assinar PRO'}
              onAction={() => checkout('PRO')}
              secondaryLabel={st.canStartTrial ? 'Iniciar teste grátis de 7 dias' : undefined}
              onSecondaryAction={st.canStartTrial ? startTrial : undefined}
              busy={busy}
            />

            <PlanCard
              title="BUSINESS"
              price={PLAN_PRICES.BUSINESS}
              active={st.plan === 'BUSINESS'}
              items={['Recursos do PRO', 'Equipe e convites', 'Permissões avançadas', 'Sem trial: libera no pagamento']}
              actionLabel={st.plan === 'BUSINESS' ? 'Gerar novo link BUSINESS' : 'Assinar BUSINESS'}
              onAction={() => checkout('BUSINESS')}
              busy={busy}
            />
          </div>
        </>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}

function FeaturePill({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${enabled ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
      {label}: {enabled ? 'liberado' : 'bloqueado'}
    </div>
  );
}

function PlanCard({
  title,
  items,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
  active,
  price,
  busy,
}: {
  title: string;
  price: string;
  items: string[];
  actionLabel: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
  active?: boolean;
  busy?: boolean;
}) {
  return (
    <Card title={title} subtitle={active ? 'Plano atual' : 'Disponível para contratação'}>
      <div className="mb-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
        {price}
      </div>
      <ul className="space-y-2 text-sm text-slate-700">
        {items.map((item) => (
          <li key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">{item}</li>
        ))}
      </ul>
      <div className="mt-4 flex flex-col gap-2">
        <Button onClick={onAction} disabled={!onAction || busy}>{actionLabel}</Button>
        {secondaryLabel && <Button variant="ghost" onClick={onSecondaryAction} disabled={!onSecondaryAction || busy}>{secondaryLabel}</Button>}
      </div>
    </Card>
  );
}
