import { Link } from 'react-router-dom';

type LegalFooterProps = {
  compact?: boolean;
};

export default function LegalFooter({ compact = false }: LegalFooterProps) {
  return (
    <footer className={compact ? 'mt-6 text-center text-sm text-slate-500' : 'border-t border-slate-200/80 bg-white/80'}>
      <div className={compact ? 'space-y-3' : 'mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8'}>
        <div>
          <div className="font-semibold text-slate-800">NexStock</div>
          <div className="text-sm text-slate-500">Estoque, vendas e operação em um só lugar.</div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-600">
          <Link to="/privacy" className="transition hover:text-slate-900">Política de Privacidade</Link>
          <Link to="/terms" className="transition hover:text-slate-900">Termos de Uso</Link>
          <a href="mailto:privacy@nexstock.com.br" className="transition hover:text-slate-900">privacy@nexstock.com.br</a>
        </div>
      </div>
    </footer>
  );
}
