"use client";
import { HeartPulse, Rocket, Sparkles, BrainCircuit, BarChart, Users, BookHeart, ShieldCheck, Sun, Moon, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/app-context';
import { useEffect } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

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
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary">
                <HeartPulse className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold font-headline">Realme</h1>
        </div>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push('/login')}>Log In</Button>
          <Button onClick={() => router.push('/signup')}>Get Started</Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 text-center container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
                Be kind to your mind.
                </h2>
                <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Realme is your personal AI wellness coach. Get personalized support, track your progress, and build healthier habits for a happier you.
                </p>
                <div className="mt-8">
                    <Button size="lg" onClick={() => router.push('/signup')}>
                    Start Your Journey <ArrowRight className="ml-2" />
                    </Button>
                </div>
            </div>
        </section>

        {/* Social Proof */}
        <section className="py-12 bg-secondary/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-center text-sm font-bold text-muted-foreground tracking-wider uppercase">
                Featured In
                </p>
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 items-center text-muted-foreground">
                    <div className="flex justify-center"><Sparkles className="h-8 w-8"/> TechCabal</div>
                    <div className="flex justify-center"><Sparkles className="h-8 w-8"/> The Guardian</div>
                    <div className="flex justify-center"><Sparkles className="h-8 w-8"/> BellaNaija</div>
                    <div className="flex justify-center"><Sparkles className="h-8 w-8"/> TechCrunch</div>
                    <div className="flex justify-center col-span-2 lg:col-span-1"><Sparkles className="h-8 w-8"/> Forbes</div>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold">A holistic approach to your well-being</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Everything you need to build mental resilience, track your progress, and feel your best.
                    </p>
                </div>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <FeatureCard
                        icon={BrainCircuit}
                        title="Personalized AI Coach"
                        description="Our AI learns from your mood, goals, and habits to provide real-time, adaptive recommendations."
                    />
                    <FeatureCard
                        icon={BarChart}
                        title="Holistic Tracking"
                        description="Connect your mood, journaling, and goals to see the patterns that affect your well-being."
                    />
                    <FeatureCard
                        icon={BookHeart}
                        title="Mental Wellness Tools"
                        description="Access AI-guided journaling, meditations, and CBT exercises whenever you need them."
                    />
                    <FeatureCard
                        icon={ShieldCheck}
                        title="Private & Secure"
                        description="Your data is yours. All personal insights are kept secure and anonymous. Always."
                    />
                    <FeatureCard
                        icon={Sun}
                        title="Build Healthy Habits"
                        description="Set small goals, track your streaks, and get gentle nudges to stay motivated on your journey."
                    />
                    <FeatureCard
                        icon={Users}
                        title="Local Resources"
                        description="Connect with verified mental health services and support groups in your local community."
                    />
                </div>
            </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 md:py-28 bg-secondary/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold">Your journey starts here</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        In just a few simple steps, you can start building a stronger, healthier mind.
                    </p>
                </div>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <StepCard number="1" title="Take Your Assessment" description="Start with a quick, private chat with our AI to personalize your experience."/>
                    <StepCard number="2" title="Get Your Plan" description="Receive your first set of goals and content tailored just for you."/>
                    <StepCard number="3" title="Track & Grow" description="Log your mood, journal your thoughts, and watch your progress over time."/>
                </div>
            </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold">Loved by users everywhere</h2>
            </div>
            <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <TestimonialCard
                text="Realme has completely changed how I approach my mental health. The AI journal prompts are surprisingly insightful."
                name="Tolu A."
                avatarHint="woman portrait"
              />
              <TestimonialCard
                text="Finally, an app that understands the Nigerian context. The local resource guide is a lifesaver."
                name="Chidi O."
                avatarHint="man portrait"
              />
              <TestimonialCard
                text="I love watching my mood chart improve. It's so motivating to see my progress visually. The gamification keeps me coming back."
                name="Fatima B."
                avatarHint="female portrait"
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-primary text-primary-foreground">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <h2 className="text-3xl md:text-4xl font-bold">Ready to feel the difference?</h2>
                <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
                    Join thousands of others on the path to mental wellness. Your first step is just a click away.
                </p>
                <div className="mt-8">
                    <Button size="lg" variant="secondary" onClick={() => router.push('/signup')}>
                    Get Started For Free
                    </Button>
                </div>
            </div>
        </section>

      </main>

      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Realme. All rights reserved.</p>
      </footer>
    </div>
  );
}

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
        </div>
        <h3 className="mt-6 text-xl font-bold">{title}</h3>
        <p className="mt-2 text-muted-foreground">
            {description}
        </p>
    </div>
);

const StepCard = ({number, title, description}: {number: string, title: string, description: string}) => (
    <div className="p-6">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mx-auto">
            {number}
        </div>
        <h3 className="mt-6 text-xl font-bold">{title}</h3>
        <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
);

const TestimonialCard = ({ text, name, avatarHint }: { text: string, name: string, avatarHint: string }) => (
  <Card className="bg-secondary/30 border-0">
    <CardContent className="p-8">
      <p className="text-muted-foreground">"{text}"</p>
      <div className="flex items-center gap-4 mt-6">
        <Avatar>
          <AvatarImage src={`https://placehold.co/100x100.png`} data-ai-hint={avatarHint} alt={name}/>
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{name}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);
