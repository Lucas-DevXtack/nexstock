import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';
import { useTheme } from '../../app/providers/ThemeProvider';
import { api } from '../../services/api';

const searchItems = [
  { label: 'Home', path: '/app/home', keywords: 'início home resumo dashboard' },
  { label: 'Dashboard', path: '/app/dashboard', keywords: 'painel dashboard visão geral kpis' },
  { label: 'Produtos', path: '/app/stock/products', keywords: 'produtos estoque sku cadastro' },
  { label: 'Movimentar', path: '/app/stock/move', keywords: 'movimentações entrada saída estoque' },
  { label: 'Saldo', path: '/app/stock/balance', keywords: 'saldo estoque inventário' },
  { label: 'Transações', path: '/app/finance/transactions', keywords: 'financeiro transações despesas receitas' },
  { label: 'Relatórios', path: '/app/reports', keywords: 'relatórios exportações pdf csv' },
  { label: 'KPIs', path: '/app/metrics', keywords: 'kpis métricas gráficos pro' },
  { label: 'Saúde do Estoque', path: '/app/pro/health', keywords: 'saúde estoque rupturas alertas' },
  { label: 'Importar Produtos', path: '/app/import/products', keywords: 'importar excel planilha xlsx csv' },
  { label: 'Billing', path: '/app/billing', keywords: 'plano cobrança assinatura upgrade mercado pago pix cartão' },
  { label: 'Perfil', path: '/app/profile', keywords: 'perfil conta senha foto avatar' },
  { label: 'Equipe', path: '/app/team', keywords: 'equipe membros convites business' },
];

export default function Topbar({ onMenuClick, isSidebarCollapsed = false }: { onMenuClick: () => void; isSidebarCollapsed?: boolean }) {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [me, setMe] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadMe = () => api('/auth/me').then(setMe).catch(() => null);
    loadMe();
    window.addEventListener('nexstock:profile-updated', loadMe);
    return () => window.removeEventListener('nexstock:profile-updated', loadMe);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
    setProfileOpen(false);
    setQuery('');
  }, [location.pathname]);

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(target)) setSearchOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const initials = useMemo(() => {
    const name = String(me?.name || 'Perfil').trim();
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((v) => v[0]?.toUpperCase() || '')
      .join('');
  }, [me]);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return searchItems.slice(0, 6);
    return searchItems
      .filter((item) => `${item.label} ${item.keywords}`.toLowerCase().includes(normalized))
      .slice(0, 8);
  }, [query]);

  function goTo(path: string) {
    navigate(path);
    setSearchOpen(false);
    setQuery('');
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (results[0]) goTo(results[0].path);
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-[#f8faf8]/90 backdrop-blur transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            aria-label={isSidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {isSidebarCollapsed ? '☷' : '☰'}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div ref={searchRef} className="relative hidden md:block">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition focus-within:border-emerald-400 dark:border-slate-700 dark:bg-slate-900">
              <span className="text-slate-400">⌕</span>
              <input
                value={query}
                onFocus={() => setSearchOpen(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchOpen(true);
                }}
                placeholder="Buscar páginas e ações"
                className="w-52 bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-slate-100 lg:w-64"
              />
            </form>
            {searchOpen && (
              <div className="absolute right-0 top-[calc(100%+12px)] w-[320px] rounded-[24px] border border-slate-200 bg-white p-2 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.3)] dark:border-slate-700 dark:bg-slate-900">
                {results.length ? results.map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => goTo(item.path)}
                    className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.label}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{item.path.replace('/app/', '')}</div>
                    </div>
                    <span className="text-slate-400">↗</span>
                  </button>
                )) : <div className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400">Nenhum resultado encontrado.</div>}
              </div>
            )}
          </div>
          <button
            onClick={toggleTheme}
            className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            title={theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-slate-200 text-sm font-bold uppercase text-slate-700 shadow-sm transition hover:-translate-y-0.5 dark:bg-slate-800 dark:text-slate-100"
            >
              {me?.avatarUrl ? (
                <img src={me.avatarUrl} alt="Perfil" className="h-full w-full object-cover" />
              ) : (
                initials || 'PA'
              )}
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-[calc(100%+12px)] w-64 rounded-[24px] border border-slate-200 bg-white p-2 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.32)] dark:border-slate-700 dark:bg-slate-900">
                <div className="rounded-2xl px-3 py-3">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{me?.name || 'Perfil'}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{me?.email || 'Sem e-mail'}</div>
                </div>
                <Link to="/app/profile" className="block rounded-2xl px-3 py-3 text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">Meu perfil</Link>
                <Link to="/app/billing" className="block rounded-2xl px-3 py-3 text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">Plano e cobrança</Link>
                <button onClick={toggleTheme} className="block w-full rounded-2xl px-3 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                  {theme === 'dark' ? 'Usar modo claro' : 'Usar modo escuro'}
                </button>
                <button onClick={logout} className="block w-full rounded-2xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-500/10">Sair</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
