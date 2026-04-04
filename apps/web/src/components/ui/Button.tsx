export default function Button({ variant = 'primary', ...props }: any) {
  const base = 'inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60';
  const styles =
    variant === 'ghost'
      ? 'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
      : variant === 'danger'
        ? 'bg-red-600 text-white shadow-sm hover:bg-red-700'
        : variant === 'soft' || variant === 'secondary'
          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20'
          : 'bg-emerald-700 text-white shadow-[0_10px_24px_-12px_rgba(6,95,70,0.7)] hover:bg-emerald-800';
  return <button {...props} className={[base, styles, props.className].filter(Boolean).join(' ')} />;
}
