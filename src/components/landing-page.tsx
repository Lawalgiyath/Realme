
"use client";
import { HeartPulse, Rocket, Sparkles, BrainCircuit, BarChart, Users, BookHeart, ShieldCheck, Sun, Moon, ArrowRight, MousePointerClick, Gamepad2, Rabbit, Cat, Dog, Bird, ChevronDown, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/app-context';
import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';


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
            setBubbles(prev => prev.map(b => ({ ...b, y: b.y - 0.5 })).filter(b => b.y > -20));
        }, 160);

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
        image: "https://i.ibb.co/V01HFS1D/pexels-googledeepmind-17484975.jpg"
    },
    {
        icon: BookHeart,
        title: "AI-Guided Journaling",
        description: "Share a short worry or a long reflection. Get a supportive, therapeutic perspective whenever you need it.",
        image: "https://i.ibb.co/sdgKHRFv/pexels-jessbaileydesign-1018133.jpg"
    },
    {
        icon: BarChart,
        title: "Holistic Tracking",
        description: "Connect your mood, journaling, and goals to see the patterns that affect your well-being.",
        image: "https://i.ibb.co/FbR99vXh/pexels-ron-lach-8441260.jpg"
    },
    {
        icon: Users,
        title: "Local Resources",
        description: "Connect with verified mental health services and support groups in your local community.",
        image: "https://i.ibb.co/qFxPXtLK/pexels-mart-production-8078408.jpg"
    },
];

const HorizontalScrollFeatures = () => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["1%", "-95%"]);
  
  return (
    <section ref={targetRef} className="relative h-[300vh] bg-background">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div style={{ x }} className="flex gap-8">
            <div className="w-screen flex-shrink-0 flex items-center justify-center">
                 <div className="text-center max-w-3xl mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold">A toolkit for a healthier mind</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Everything you need to build mental resilience, track your progress, and feel your best, all in one place. Keep scrolling...
                    </p>
                </div>
            </div>
          {features.map((card) => {
            return <FeatureCard card={card} key={card.title} />;
          })}
        </motion.div>
      </div>
    </section>
  );
};

const FeatureCard = ({ card }: { card: typeof features[0] }) => {
  return (
    <div
      key={card.title}
      className="group relative h-[450px] w-[600px] overflow-hidden rounded-2xl shadow-2xl bg-card border"
    >
      <div
        style={{
          backgroundImage: `url(${card.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="absolute inset-0 z-0 transition-transform duration-300 group-hover:scale-110"
      ></div>
       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
      <div className="absolute bottom-0 left-0 p-6 text-white z-20">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                <card.icon className="w-5 h-5"/>
            </div>
             <h3 className="text-xl font-bold">{card.title}</h3>
        </div>
        <p className="mt-2 text-white/80">{card.description}</p>
      </div>
    </div>
  );
};


export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useApp();

  useEffect(() => {
    if (!loading && user) {
        if(user.isLeader) {
            router.replace('/organization/dashboard');
        } else {
            router.replace('/dashboard');
        }
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
            <Button variant="ghost" onClick={() => router.push('/organization/login')}>For Organizations</Button>
            <Button variant="ghost" onClick={() => router.push('/login')}>Log In</Button>
            <Button onClick={() => router.push('/signup')}>Get Started</Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 text-center container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
                <div className="max-w-xl">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
                        Be kind to your mind.
                    </h2>
                    <p className="mt-6 text-lg sm:text-xl text-muted-foreground">
                        Realme is your personal AI wellness coach. Get personalized support, track your progress, and build healthier habits for a happier you.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-start gap-4">
                        <Button size="lg" onClick={() => router.push('/signup')}>
                            Start for Free <ArrowRight className="ml-2" />
                        </Button>
                    </div>
                </div>
                 <div className="relative aspect-square max-w-lg mx-auto lg:mx-0 shadow-inner-strong rounded-2xl p-2 bg-background">
                    <Image
                        src="https://i.ibb.co/DPSKSxS2/pexels-sam-jhay-316274033-14024358.jpg"
                        alt="A person meditating peacefully outdoors"
                        width={800}
                        height={800}
                        className="rounded-xl w-full h-full object-cover"
                        priority
                    />
                </div>
            </div>
        </section>

        {/* Features Section */}
        <HorizontalScrollFeatures />
        
        {/* Calming Game Section */}
         <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center max-w-3xl mx-auto">
                 <div className="mx-auto w-fit p-3 rounded-full bg-primary/10 border-2 border-primary/20 mb-4">
                    <Gamepad2 className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">Take a Mindful Moment</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    Feeling overwhelmed? Take a deep breath and enjoy this simple calming game. There's no goal, just a moment of peace.
                </p>
            </div>
            <div className="mt-16 max-w-2xl mx-auto">
                <BubblePopGame />
            </div>
          </div>
        </section>

        {/* Organization CTA */}
        <section className="py-20 md:py-28 bg-secondary/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="lg:col-span-1">
                        <div className="p-3 rounded-full bg-primary/10 border-2 border-primary/20 w-fit mb-4">
                            <Briefcase className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold">Realme for Teams</h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Support your team's mental health with anonymized wellness insights, engagement tracking, and AI-powered recommendations to foster a healthier, more productive work environment.
                        </p>
                        <div className="mt-8 flex gap-4">
                            <Button size="lg" onClick={() => router.push('/organization/signup')}>
                                Get Started for Your Team
                            </Button>
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <Image
                            src="https://i.ibb.co/whjWRmwM/pexels-mikael-blomkvist-6476255.jpg"
                            alt="A team collaborating in a modern office"
                            width={800}
                            height={500}
                            className="rounded-lg shadow-lg w-full h-full object-cover"
                        />
                    </div>
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
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button size="lg" variant="secondary" onClick={() => router.push('/signup')}>
                    Sign Up for Free
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
