import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import { getConsentChoice, setConsentChoice } from '../../utils/consent';
import { Link } from 'react-router-dom';

export default function ConsentBanner() {
  const [choice, setChoice] = useState(getConsentChoice());

  useEffect(() => {
    const handler = () => setChoice(getConsentChoice());
    window.addEventListener('nexstock:consent-changed', handler as EventListener);
    return () => window.removeEventListener('nexstock:consent-changed', handler as EventListener);
  }, []);

  if (choice !== 'unset') return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_30px_70px_-30px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Privacidade e consentimento</p>
            <h2 className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">Você decide se quer liberar coleta de dados de uso não essenciais.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              O NexStock usa dados de navegação e métricas de QR code apenas para analytics, segurança e melhoria do produto.
              O sistema continua funcionando mesmo se você recusar. Leia a <Link to="/privacy" className="font-semibold text-slate-900 underline">Política de Privacidade</Link>.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="ghost" onClick={() => setConsentChoice('rejected')}>Recusar analytics</Button>
            <Button onClick={() => setConsentChoice('accepted')}>Aceitar analytics</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
