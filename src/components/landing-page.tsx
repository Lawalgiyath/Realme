
"use client";
import { HeartPulse, Rocket, Sparkles, BrainCircuit, BarChart, Users, BookHeart, ShieldCheck, Sun, Moon, ArrowRight, MousePointerClick, Gamepad2, Rabbit, Cat, Dog, Bird } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/app-context';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Bubble Pop Game Component
const BubblePopGame = () => {
    const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            if (bubbles.length < 15) {
                const newBubble = {
                    id: Date.now(),
                    x: Math.random() * 100,
                    y: 110, // Start from below the view
                    size: Math.random() * 30 + 20,
                };
                setBubbles(prev => [...prev, newBubble]);
            }
        }, 1000); // Add a new bubble every second

        return () => clearInterval(interval);
    }, [bubbles.length]);
    
    useEffect(() => {
        const moveInterval = setInterval(() => {
            setBubbles(prev => prev.map(b => ({ ...b, y: b.y - 1 })).filter(b => b.y > -20));
        }, 50);

        return () => clearInterval(moveInterval);
    }, []);

    const popBubble = (id: number) => {
        setBubbles(prev => prev.filter(b => b.id !== id));
        setScore(s => s + 1);
    };

    return (
        <div className="relative w-full h-80 bg-primary/5 rounded-lg overflow-hidden border">
            <AnimatePresence>
                {bubbles.map(bubble => (
                    <motion.div
                        key={bubble.id}
                        initial={{ y: 100, opacity: 1 }}
                        animate={{ y: bubble.y + '%' }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="absolute rounded-full bg-primary/20 border border-primary/50 cursor-pointer"
                        style={{
                            left: `${bubble.x}%`,
                            top: `${bubble.y}%`,
                            width: bubble.size,
                            height: bubble.size,
                        }}
                        onClick={() => popBubble(bubble.id)}
                    />
                ))}
            </AnimatePresence>
             <div className="absolute top-4 right-4 text-primary font-bold bg-background/80 px-3 py-1 rounded-md">Score: {score}</div>
             <div className="absolute bottom-4 left-4 text-muted-foreground text-sm">A simple game to calm your mind.</div>
        </div>
    );
};


// Feature Cards Component
const features = [
    {
        icon: BrainCircuit,
        title: "Personalized AI Coach",
        description: "Aya learns from your mood and goals to provide adaptive recommendations and organize your day for success.",
        color: "from-blue-500 to-cyan-400"
    },
    {
        icon: BookHeart,
        title: "AI-Guided Journaling",
        description: "Share a short worry or a long reflection. Get a supportive, therapeutic perspective whenever you need it.",
        color: "from-purple-500 to-pink-400"
    },
    {
        icon: BarChart,
        title: "Holistic Tracking",
        description: "Connect your mood, journaling, and goals to see the patterns that affect your well-being.",
        color: "from-green-500 to-teal-400"
    },
    {
        icon: Users,
        title: "Local Resources",
        description: "Connect with verified mental health services and support groups in your local community.",
        color: "from-yellow-500 to-orange-400"
    },
];

const InteractiveFeatureCards = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    const handleCardClick = (index: number) => {
        setActiveIndex(index);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="relative h-96">
                {features.map((feature, index) => {
                    const isActive = index === activeIndex;
                    return (
                        <motion.div
                            key={feature.title}
                            className={cn(
                                "absolute w-full h-full p-8 rounded-2xl text-white flex flex-col justify-end cursor-pointer shadow-2xl",
                                "transform-gpu transition-all duration-500 ease-in-out bg-gradient-to-br",
                                feature.color
                            )}
                            initial={{ y: 0, scale: 0.8, opacity: 0 }}
                            animate={{
                                y: isActive ? 0 : (index - activeIndex) * -10,
                                scale: isActive ? 1 : 1 - (Math.abs(index - activeIndex) * 0.1),
                                zIndex: features.length - Math.abs(index - activeIndex),
                                opacity: isActive ? 1 : 1 - (Math.abs(index - activeIndex) * 0.3)
                            }}
                            onClick={() => handleCardClick(index)}
                        >
                            <feature.icon className="w-10 h-10 mb-4" />
                            <h3 className="text-2xl font-bold">{feature.title}</h3>
                            <p className="opacity-80 mt-2">{feature.description}</p>
                        </motion.div>
                    );
                })}
            </div>
            <div className="flex flex-col gap-4">
                {features.map((feature, index) => (
                    <Button
                        key={feature.title}
                        variant={activeIndex === index ? 'secondary' : 'ghost'}
                        onClick={() => handleCardClick(index)}
                        className="justify-start p-6 text-left h-auto"
                    >
                        <feature.icon className="w-6 h-6 mr-4 text-primary" />
                        <div>
                            <p className="font-bold text-base">{feature.title}</p>
                            <p className="text-sm text-muted-foreground">Click to learn more</p>
                        </div>
                    </Button>
                ))}
            </div>
        </div>
    );
};


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
        <section className="relative py-20 md:py-32 text-center container mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/30 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/4 w-80 h-80 bg-secondary/30 rounded-full filter blur-3xl opacity-50 animation-delay-2000 animate-pulse"></div>
            </div>
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
             <div className="absolute bottom-0 left-0 right-0 h-32" style={{
                background: 'linear-gradient(to top, hsl(var(--background)), transparent)'
            }}></div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold">A toolkit for a healthier mind</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Everything you need to build mental resilience, track your progress, and feel your best, all in one place.
                    </p>
                </div>
                <div className="mt-16">
                    <InteractiveFeatureCards />
                </div>
            </div>
        </section>

        {/* Game Section */}
        <section className="py-20 md:py-28 bg-secondary/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto">
                     <h2 className="text-3xl md:text-4xl font-bold">Take a Mindful Moment</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Feeling overwhelmed? Take a short break with a simple, calming game to reset your focus.
                    </p>
                </div>
                 <div className="mt-16 max-w-4xl mx-auto">
                    <BubblePopGame />
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
                icon={Rabbit}
              />
              <TestimonialCard
                text="Finally, an app that understands the Nigerian context. The local resource guide is a lifesaver."
                name="Chidi O."
                icon={Cat}
              />
              <TestimonialCard
                text="I love watching my mood chart improve. It's so motivating to see my progress visually. The gamification keeps me coming back."
                name="Fatima B."
                icon={Bird}
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


const TestimonialCard = ({ text, name, icon: Icon }: { text: string, name: string, icon: React.ElementType }) => (
  <Card className="bg-secondary/30 border-0">
    <CardContent className="p-8">
      <p className="text-muted-foreground">"{text}"</p>
      <div className="flex items-center gap-4 mt-6">
        <Avatar>
            <AvatarFallback className="bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
            </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{name}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

    