export default function Alert({ type='info', children }: { type?: 'info'|'error'|'warn'; children: any }) {
  const map: any = {
    info: 'border-gray-200 bg-gray-50 text-gray-700',
    warn: 'border-amber-200 bg-amber-50 text-amber-800',
    error: 'border-red-200 bg-red-50 text-red-700',
  };
  return <div className={['rounded-2xl border p-4 text-sm', map[type]].join(' ')}>{children}</div>;
}
