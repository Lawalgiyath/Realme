import LandingPage from '@/components/landing-page';
import { AppProvider } from '@/context/app-context';

export default function Home() {
  return (
    <AppProvider>
      <LandingPage />
    </AppProvider>
  );
}
