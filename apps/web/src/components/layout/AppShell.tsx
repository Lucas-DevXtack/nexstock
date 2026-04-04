import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

function getInitialCollapsed() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem('nexstock-sidebar-collapsed') === 'true';
}

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(getInitialCollapsed);

  useEffect(() => {
    window.localStorage.setItem('nexstock-sidebar-collapsed', String(desktopCollapsed));
  }, [desktopCollapsed]);

  function handleMenuClick() {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setDesktopCollapsed((v) => !v);
      return;
    }
    setSidebarOpen((v) => !v);
  }

  return (
    <div className="min-h-screen bg-[#f4f6f4] text-slate-900 transition-colors duration-300 dark:bg-[#0b1220] dark:text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar open={sidebarOpen} collapsed={desktopCollapsed} onClose={() => setSidebarOpen(false)} />
        <div
          className={[
            'flex min-w-0 flex-1 flex-col transition-[padding] duration-300',
            desktopCollapsed ? 'lg:pl-[104px]' : 'lg:pl-[300px]',
          ].join(' ')}
        >
          <Topbar onMenuClick={handleMenuClick} isSidebarCollapsed={desktopCollapsed} />
          <main className="flex-1 px-4 pb-8 pt-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1240px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
