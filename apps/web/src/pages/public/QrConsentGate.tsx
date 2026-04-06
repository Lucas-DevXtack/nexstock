import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { API_URL } from '../../services/api';
import { getConsentChoice, setConsentChoice } from '../../utils/consent';

const FALLBACK_WEB_URL = 'https://nexstock-web.vercel.app';

function directTarget(slug: string) {
  const root = (import.meta.env.VITE_WEB_URL || FALLBACK_WEB_URL).replace(/\/$/, '');
  if (slug === 'app') return `${root}/login?utm_source=qr&utm_medium=offline&utm_campaign=nexstock_app`;
  if (slug === 'signup') return `${root}/signup?utm_source=qr&utm_medium=offline&utm_campaign=nexstock_signup`;
  return `${root}/?utm_source=qr&utm_medium=offline&utm_campaign=nexstock_main`;
}

export default function QrConsentGate() {
  const params = useParams();
  const slug = params.slug || 'main';
  const [choice, setChoice] = useState(getConsentChoice());

  const apiQrUrl = useMemo(() => `${API_URL}/qr/${slug}?consent=true`, [slug]);
  const fallbackUrl = useMemo(() => directTarget(slug), [slug]);

  useEffect(() => {
    if (choice === 'accepted') {
      window.location.replace(apiQrUrl);
      return;
    }
    if (choice === 'rejected') {
      window.location.replace(fallbackUrl);
    }
  }, [apiQrUrl, fallbackUrl, choice]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-lg rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.3)]">
        <div className="mb-6 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-700 text-2xl font-black text-white">NX</div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">Consentimento para analytics do QR</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Você pode permitir a coleta de dados de uso não essenciais para medir scans, dispositivo e desempenho do QR code.
            Se recusar, o NexStock abre normalmente sem registrar analytics.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={() => {
              setConsentChoice('accepted');
              setChoice('accepted');
            }}
          >
            Aceitar e continuar
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setConsentChoice('rejected');
              setChoice('rejected');
            }}
          >
            Continuar sem analytics
          </Button>
        </div>

        <p className="mt-5 text-center text-xs leading-6 text-slate-500">
          Ao continuar, você confirma que leu os <Link to="/terms" className="font-semibold text-slate-900 underline">Termos de Uso</Link> e a{' '}
          <Link to="/privacy" className="font-semibold text-slate-900 underline">Política de Privacidade</Link>.
        </p>
      </div>
    </main>
  );
}
