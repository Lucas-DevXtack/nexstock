import { Navigate, createBrowserRouter } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import AppShell from '../components/layout/AppShell';
import ProtectedRoute from '../components/layout/ProtectedRoute';

import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import SelectTenant from '../pages/tenants/SelectTenant';
import CreateTenant from '../pages/tenants/CreateTenant';
import Onboarding from '../pages/onboarding/Onboarding';
import ImportWizard from '../pages/onboarding/ImportWizard';

import Home from '../pages/home/Home';
import Dashboard from '../pages/dashboard/Dashboard';
import Products from '../pages/stock/Products';
import NewMove from '../pages/stock/NewMove';
import Balance from '../pages/stock/Balance';
import Transactions from '../pages/finance/Transactions';
import Team from '../pages/team/Team';
import AcceptInvite from '../pages/team/AcceptInvite';
import Billing from '../pages/billing/Billing';
import Reports from '../pages/reports/Reports';
import Metrics from '../pages/pro/Metrics';
import Health from '../pages/pro/Health';
import ImportProducts from '../pages/importexport/ImportProducts';
import Profile from '../pages/profile/Profile';
import Audit from '../pages/audit/Audit';

import MarketingHome from '../pages/public/MarketingHome';
import PrivacyPolicy from '../pages/public/PrivacyPolicy';
import TermsOfUse from '../pages/public/TermsOfUse';
import QrConsentGate from '../pages/public/QrConsentGate';

export const router = createBrowserRouter([
  {
    element: <AppLayout />, // 👈 ROOT GLOBAL (resolve seu problema)
    children: [
      // 🌐 PÚBLICO
      { path: '/', element: <MarketingHome /> },
      { path: '/privacy', element: <PrivacyPolicy /> },
      { path: '/terms', element: <TermsOfUse /> },
      { path: '/qr', element: <QrConsentGate /> },
      { path: '/qr/:slug', element: <QrConsentGate /> },

      // 🔐 AUTH
      { path: '/login', element: <Login /> },
      { path: '/signup', element: <Signup /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/reset-password', element: <ResetPassword /> },

      // 🏢 TENANT / ONBOARDING
      { path: '/tenant/select', element: <SelectTenant /> },
      { path: '/tenant/create', element: <CreateTenant /> },
      { path: '/onboarding', element: <Onboarding /> },
      { path: '/onboarding/import', element: <ImportWizard /> },
      { path: '/invite/accept', element: <AcceptInvite /> },

      // 🚀 APP PROTEGIDO
      {
        path: '/app',
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppShell />,
            children: [
              { index: true, element: <Navigate to="home" replace /> },
              { path: 'home', element: <Home /> },
              { path: 'dashboard', element: <Dashboard /> },
              { path: 'stock/products', element: <Products /> },
              { path: 'stock/move', element: <NewMove /> },
              { path: 'stock/balance', element: <Balance /> },
              { path: 'finance/transactions', element: <Transactions /> },
              { path: 'team', element: <Team /> },
              { path: 'billing', element: <Billing /> },
              { path: 'reports', element: <Reports /> },
              { path: 'metrics', element: <Metrics /> },
              { path: 'pro/health', element: <Health /> },
              { path: 'import/products', element: <ImportProducts /> },
              { path: 'profile', element: <Profile /> },
              { path: 'audit', element: <Audit /> },
            ],
          },
        ],
      },
    ],
  },
]);
