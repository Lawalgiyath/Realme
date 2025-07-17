'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { FileText, GlassWater, HeartPulse, Library, Target } from 'lucide-react';

const onboardingSlides = [
  {
    icon: HeartPulse,
    title: 'Welcome to Realme!',
    description: "Your personalized guide to mental wellness. Let's take a quick tour of what you can do.",
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    aiHint: 'welcome abstract',
  },
  {
    icon: FileText,
    title: 'Understand Yourself Better',
    description: 'Start with a private AI-powered assessment. Your answers help us tailor content and resources just for you.',
    image: 'https://images.unsplash.com/photo-1516534778569-5e7956b94748?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    aiHint: 'questions form',
  },
  {
    icon: Target,
    title: 'Set and Track Your Goals',
    description: 'Define what wellness means to you. Create personal goals and track your progress as you go.',
    image: 'https://images.unsplash.com/photo-1542744095-291d1f67b221?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    aiHint: 'goals target',
  },
  {
    icon: GlassWater,
    title: 'Find Calm with the Worry Jar',
    description: 'Feeling anxious? Write down your worries and let our AI provide a calming, reframed thought.',
    image: 'https://images.unsplash.com/photo-1501199532894-9449c3a44a9a?q=80&w=1996&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    aiHint: 'calm water',
  },
  {
    icon: Library,
    title: "You're All Set!",
    description: 'Explore personalized articles, track your mood, and find local resources. Your journey starts now.',
    image: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    aiHint: 'journey path',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      const nextButton = document.querySelector('.embla__next') as HTMLButtonElement | null;
      nextButton?.click();
    } else {
      router.push('/dashboard');
    }
  };
  
  const handlePrev = () => {
      const prevButton = document.querySelector('.embla__prev') as HTMLButtonElement | null;
      prevButton?.click();
  }

  const progress = ((currentSlide + 1) / onboardingSlides.length) * 100;

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/50 p-4">
      <div className="w-full max-w-2xl">
        <Carousel
            opts={{
                align: "start",
                loop: false,
            }}
            setApi={(api) => {
                if(api) {
                    api.on("select", () => {
                        setCurrentSlide(api.selectedScrollSnap());
                    });
                }
            }}
            className="w-full"
        >
          <CarouselContent>
            {onboardingSlides.map((slide, index) => {
                const Icon = slide.icon;
                return (
                    <CarouselItem key={index}>
                        <Card>
                        <CardContent className="flex flex-col items-center justify-center p-6 md:p-12 text-center">
                           <div className='w-full h-64 md:h-80 relative rounded-lg overflow-hidden mb-6'>
                                <Image
                                    src={slide.image}
                                    alt={slide.title}
                                    layout="fill"
                                    objectFit="cover"
                                    data-ai-hint={slide.aiHint}
                                    className="bg-muted"
                                />
                            </div>
                            <div className="p-2 bg-primary/10 rounded-full mb-4">
                                <Icon className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold">{slide.title}</h3>
                            <p className="text-muted-foreground mt-2 max-w-md">{slide.description}</p>
                        </CardContent>
                        </Card>
                    </CarouselItem>
                )
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex embla__prev" />
          <CarouselNext className="hidden sm:flex embla__next" />
        </Carousel>
        
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-auto order-2 sm:order-1 flex items-center justify-center gap-2">
            {onboardingSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                   const carouselApi = (document.querySelector('.embla') as any)?.__embla;
                   carouselApi?.scrollTo(index);
                }}
                className={`h-2 w-2 rounded-full transition-all ${currentSlide === index ? 'bg-primary w-4' : 'bg-muted'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          <Progress value={progress} className="w-full h-2 order-1 sm:order-2 flex-1" />
          <Button onClick={handleNext} className="w-full sm:w-auto order-3" size="lg">
            {currentSlide === onboardingSlides.length - 1 ? "Go to Dashboard" : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
