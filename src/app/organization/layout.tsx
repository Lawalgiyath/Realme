
'use client';
import { useApp } from '@/context/app-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user?.isLeader) {
      router.replace('/organization/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user.isLeader) {
       return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4">Redirecting...</p>
      </div>
    );
  }

  return <>{children}</>;
}
