import React, { createContext, useContext, useMemo, useState } from 'react';
import { storage } from '../../utils/storage';

type TenantCtx = { tenantId: string; setTenantId: (id: string) => void; };
const Ctx = createContext<TenantCtx | null>(null);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenantId, _set] = useState(storage.tenantId);
  function setTenantId(id: string) { storage.tenantId = id; _set(id); }
  const value = useMemo(() => ({ tenantId, setTenantId }), [tenantId]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTenant() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTenant must be used inside TenantProvider');
  return v;
}
