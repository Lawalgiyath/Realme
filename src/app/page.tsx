import Dashboard from '@/components/dashboard';
import { AppProvider } from '@/context/app-context';

export default function Home() {
  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  );
}
