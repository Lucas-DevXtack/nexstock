import { Outlet } from 'react-router-dom';
import ConsentBanner from '../../components/public/ConsentBanner';

export default function AppLayout() {
  return (
    <>
      <ConsentBanner />
      <Outlet />
    </>
  );
}