import { Link } from 'react-router-dom';

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur dark:border-slate-200/80 dark:bg-white/85">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700 text-sm font-black text-white shadow-[0_10px_24px_-12px_rgba(6,95,70,0.7)]">
            NX
          </div>
          <div>
            <div className="text-sm font-black tracking-tight text-slate-900 dark:text-slate-900">NexStock</div>
            <div className="text-xs text-slate-500 dark:text-slate-500">Estoque, vendas e operação em um só lugar</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex dark:text-slate-600">
          <a href="#beneficios" className="transition hover:text-slate-900 dark:hover:text-slate-900">Benefícios</a>
          <a href="#recursos" className="transition hover:text-slate-900 dark:hover:text-slate-900">Recursos</a>
          <a href="#planos" className="transition hover:text-slate-900 dark:hover:text-slate-900">Planos</a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-[20px] px-4 py-2.5 text-sm font-semibold text-slate-700 transition duration-200 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-700 dark:hover:bg-slate-100 dark:hover:text-slate-950"
          >
            Entrar
          </Link>
          <Link
            to="/signup"
            className="group inline-flex items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_34px_-20px_rgba(5,150,105,0.7)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_42px_-20px_rgba(5,150,105,0.78)]"
          >
            Criar conta <span className="transition group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
