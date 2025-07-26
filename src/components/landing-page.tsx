
"use client";
import { HeartPulse, Rocket, Sparkles, BrainCircuit, BarChart, Users, BookHeart, ShieldCheck, Sun, Moon, ArrowRight, MousePointerClick, Gamepad2, Rabbit, Cat, Dog, Bird, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/app-context';
import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
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

const InteractiveFeatureCards = () => {
    const [cards, setCards] = useState(features);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const cycleCards = useCallback(() => {
        setCards(prevCards => {
            const newCards = [...prevCards];
            const first = newCards.shift()!;
            newCards.push(first);
            return newCards;
        });
    }, []);

    useEffect(() => {
        intervalRef.current = setInterval(cycleCards, 5000);
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [cycleCards]);

    const handleCardClick = (index: number) => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        
        setCards(prevCards => {
            let newCards = [...prevCards];
            // Move the clicked card to the front (end of the array)
            const clickedCard = newCards.splice(index, 1)[0];
            newCards.push(clickedCard);
            // Reorder the rest to put the new front card at the end of the original array logic.
            const frontCardIndex = features.findIndex(f => f.title === clickedCard.title);
            
            const reorderedFeatures = [...features];
            const [item] = reorderedFeatures.splice(frontCardIndex, 1);
            reorderedFeatures.push(item);
            
            // This logic is simplified to just move clicked to front
            const finalCards = [...prevCards.filter(c => c.title !== clickedCard.title), clickedCard];
            return finalCards;
        });

    };
    
    const isMobile = useIsMobile();
    if (isMobile) {
        return (
            <div className="flex flex-col gap-4">
                {features.map((feature, index) => (
                    <Card key={feature.title} className="bg-secondary/50">
                        <CardHeader>
                            <div className="flex items-center gap-4 mb-2">
                                <feature.icon className="w-6 h-6 text-primary" />
                                <CardTitle className="text-lg">{feature.title}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
             <div className="relative h-[450px] w-full max-w-md mx-auto">
                <AnimatePresence>
                    {cards.map((card, index) => {
                        const isFrontCard = index === cards.length - 1;
                        return (
                             <motion.div
                                key={card.title}
                                className={cn(
                                    "absolute w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-card border",
                                    "transform-gpu cursor-pointer"
                                )}
                                initial={{ scale: 0.9, y: 30, opacity: 0 }}
                                animate={{
                                    scale: 1 - (cards.length - 1 - index) * 0.05,
                                    y: (cards.length - 1 - index) * -15,
                                    opacity: 1,
                                    zIndex: index,
                                }}
                                exit={{ y: 50, opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                onClick={() => isFrontCard ? cycleCards() : handleCardClick(index)}
                            >
                                <Image
                                    src={card.image}
                                    alt={card.title}
                                    layout="fill"
                                    objectFit="cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-6 text-white">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                                            <card.icon className="w-5 h-5"/>
                                        </div>
                                         <h3 className="text-xl font-bold">{card.title}</h3>
                                    </div>
                                    <p className="mt-2 text-white/80">{card.description}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
            <div className="flex flex-col gap-4">
                {features.map((feature) => {
                    const isActive = cards[cards.length - 1].title === feature.title;
                    return (
                        <Button
                            key={feature.title}
                            variant={isActive ? 'secondary' : 'ghost'}
                            onClick={() => {
                                const cardIndex = cards.findIndex(c => c.title === feature.title);
                                if (cardIndex !== -1) handleCardClick(cardIndex);
                            }}
                            className="justify-start p-6 text-left h-auto"
                        >
                            <feature.icon className="w-6 h-6 mr-4 text-primary" />
                            <div>
                                <p className="font-bold text-base">{feature.title}</p>
                                <p className="text-sm text-muted-foreground">Click to learn more</p>
                            </div>
                        </Button>
                    )
                })}
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
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost">Log In <ChevronDown className="ml-2 h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push('/login')}>
                        For Individuals
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/organization/login')}>
                        For Organizations
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button>Get Started <ChevronDown className="ml-2 h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push('/signup')}>
                        For Individuals
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/organization/signup')}>
                        For Organizations
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
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
                            Start as an Individual <ArrowRight className="ml-2" />
                        </Button>
                        <Button size="lg" variant="outline" onClick={() => router.push('/organization/signup')}>
                            Register an Organization
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
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button size="lg" variant="secondary" onClick={() => router.push('/signup')}>
                    Sign Up as an Individual
                    </Button>
                     <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10" onClick={() => router.push('/organization/signup')}>
                        Register an Organization
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

    