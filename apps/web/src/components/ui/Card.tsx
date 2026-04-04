export default function Card({ title, subtitle, children, className = '' }: { title?: string; subtitle?: string; children: any; className?: string }) {
  return (
    <div className={[
      'surface premium-hover rounded-[28px] p-5 fade-in-up',
      className,
    ].filter(Boolean).join(' ')}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <div className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">{title}</div>}
          {subtitle && <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
