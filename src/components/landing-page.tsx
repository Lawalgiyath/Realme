"use client";
import { HeartPulse, Rocket, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/app-context';
import { useEffect } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useApp();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);
  
  if (loading || user) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <HeartPulse className="h-12 w-12 animate-pulse text-primary" />
        </div>
      )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary">
                <HeartPulse className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Realme</h1>
        </div>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push('/login')}>Log In</Button>
          <Button onClick={() => router.push('/signup')}>Sign Up</Button>
        </nav>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground tracking-tight">
            Your Personal Path to <span className="text-primary">Mental Wellness</span>
          </h2>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Realme is an AI-powered platform designed to provide you with personalized mental health support, resources, and tools to navigate life's challenges.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" onClick={() => router.push('/signup')}>
              <Rocket className="mr-2" />
              Get Started for Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/login')}>
              I Have an Account
            </Button>
          </div>
        </div>

        <div className="mt-20 w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-6 border rounded-lg bg-card">
                <Sparkles className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-bold text-lg text-card-foreground">AI-Powered Insights</h3>
                <p className="text-muted-foreground mt-2">Complete a private assessment and receive personalized content and recommendations tailored to your unique needs.</p>
            </div>
            <div className="p-6 border rounded-lg bg-card">
                <HeartPulse className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-bold text-lg text-card-foreground">Daily Wellness Tools</h3>
                <p className="text-muted-foreground mt-2">Track your mood, set wellness goals, and use our "Worry Jar" to find calm in moments of anxiety.</p>
            </div>
             <div className="p-6 border rounded-lg bg-card">
                <Rocket className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-bold text-lg text-card-foreground">Local Resources</h3>
                <p className="text-muted-foreground mt-2">Connect with mental health organizations and support services right here in Nigeria.</p>
            </div>
        </div>
      </main>
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
        © {new Date().getFullYear()} Realme. All rights reserved.
      </footer>
    </div>
  );
}
