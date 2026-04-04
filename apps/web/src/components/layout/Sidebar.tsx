import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

type Props = {
  open?: boolean;
  collapsed?: boolean;
  onClose?: () => void;
};

function HomeIcon() { return <span className="text-lg">⌂</span>; }
function BoxIcon() { return <span className="text-lg">▣</span>; }
function MoveIcon() { return <span className="text-lg">↹</span>; }
function ChartIcon() { return <span className="text-lg">▥</span>; }
function MoneyIcon() { return <span className="text-lg">◔</span>; }
function TeamIcon() { return <span className="text-lg">👥</span>; }
function FileIcon() { return <span className="text-lg">🗎</span>; }

function Item({ to, label, icon, onClick, collapsed = false }: { to: string; label: string; icon: ReactNode; onClick?: () => void; collapsed?: boolean }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        [
          'flex items-center rounded-2xl px-4 py-3 text-[15px] font-medium transition-all duration-200',
          collapsed ? 'justify-center' : 'gap-3',
          isActive
            ? 'bg-emerald-700 text-white shadow-[0_16px_30px_-20px_rgba(6,95,70,0.85)]'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
        ].join(' ')
      }
    >
      <span className="grid h-6 w-6 place-items-center">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

export default function Sidebar({ open = false, collapsed = false, onClose }: Props) {
  return (
    <>
      <div
        className={[
          'fixed inset-0 z-30 bg-slate-900/40 transition lg:hidden',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        onClick={onClose}
      />
      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 overflow-y-auto border-r border-slate-200 bg-[#f8faf8] px-4 py-6 transition-[width,transform] duration-300 dark:border-slate-800 dark:bg-slate-950',
          collapsed ? 'w-[104px]' : 'w-[300px]',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
        ].join(' ')}
      >
        <div className={['mb-8 flex items-center', collapsed ? 'justify-center' : 'gap-3'].join(' ')}>
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-emerald-700 text-2xl font-black text-white">N</div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-[20px] font-extrabold tracking-tight text-slate-900 dark:text-white">NexStock</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Estoque e Financeiro</div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            {!collapsed && <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Geral</div>}
            <div className="space-y-1.5">
              <Item to="/app/home" label="Home" icon={<HomeIcon />} onClick={onClose} collapsed={collapsed} />
              <Item to="/app/dashboard" label="Dashboard" icon={<ChartIcon />} onClick={onClose} collapsed={collapsed} />
              <Item to="/app/stock/products" label="Produtos" icon={<BoxIcon />} onClick={onClose} collapsed={collapsed} />
              <Item to="/app/stock/move" label="Movimentar" icon={<MoveIcon />} onClick={onClose} collapsed={collapsed} />
              <Item to="/app/stock/balance" label="Saldo" icon={<ChartIcon />} onClick={onClose} collapsed={collapsed} />
            </div>
          </div>

          <div>
            {!collapsed && <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Financeiro (PRO)</div>}
            <div className="space-y-1.5">
              <Item to="/app/finance/transactions" label="Transações" icon={<MoneyIcon />} onClick={onClose} collapsed={collapsed} />
            </div>
          </div>

          <div>
            {!collapsed && <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Conta</div>}
            <div className="space-y-1.5">
              <Item to="/app/metrics" label="KPIs (PRO)" icon={<ChartIcon />} onClick={onClose} collapsed={collapsed} />
              <Item to="/app/pro/health" label="Saúde do Estoque (PRO)" icon={<ChartIcon />} onClick={onClose} collapsed={collapsed} />
              <Item to="/app/import/products" label="Importar (Excel)" icon={<FileIcon />} onClick={onClose} collapsed={collapsed} />
              <Item to="/app/reports" label="Relatórios" icon={<FileIcon />} onClick={onClose} collapsed={collapsed} />
              <Item to="/app/profile" label="Perfil" icon={<HomeIcon />} onClick={onClose} collapsed={collapsed} />
              <Item to="/app/billing" label="Plano e Cobrança" icon={<MoneyIcon />} onClick={onClose} collapsed={collapsed} />
              <Item to="/app/team" label="Equipe (BUSINESS)" icon={<TeamIcon />} onClick={onClose} collapsed={collapsed} />
              <Item to="/app/audit" label="Auditoria" icon={<FileIcon />} onClick={onClose} collapsed={collapsed} />
              <Item to="/tenant/select" label="Minhas empresas" icon={<MoveIcon />} onClick={onClose} collapsed={collapsed} />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
