export const storage = {
  get token() { return localStorage.getItem('ns_token') || ''; },
  set token(v: string) { v ? localStorage.setItem('ns_token', v) : localStorage.removeItem('ns_token'); },

  get refreshToken() { return localStorage.getItem('ns_refresh_token') || ''; },
  set refreshToken(v: string) { v ? localStorage.setItem('ns_refresh_token', v) : localStorage.removeItem('ns_refresh_token'); },

  get tenantId() { return localStorage.getItem('ns_tenant') || ''; },
  set tenantId(v: string) { v ? localStorage.setItem('ns_tenant', v) : localStorage.removeItem('ns_tenant'); },

  clearAuth() {
    localStorage.removeItem('ns_token');
    localStorage.removeItem('ns_refresh_token');
  },

  clearAll() {
    this.clearAuth();
    localStorage.removeItem('ns_tenant');
  },
};
