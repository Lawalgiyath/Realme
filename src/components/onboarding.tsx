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
    image: 'https://placehold.co/600x400.png',
    aiHint: 'welcome abstract',
  },
  {
    icon: FileText,
    title: 'Understand Yourself Better',
    description: 'Start with a private AI-powered assessment. Your answers help us tailor content and resources just for you.',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'questions form',
  },
  {
    icon: Target,
    title: 'Set and Track Your Goals',
    description: 'Define what wellness means to you. Create personal goals and track your progress as you go.',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'goals target',
  },
  {
    icon: GlassWater,
    title: 'Find Calm with the Worry Jar',
    description: 'Feeling anxious? Write down your worries and let our AI provide a calming, reframed thought.',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'calm water',
  },
  {
    icon: Library,
    title: "You're All Set!",
    description: 'Explore personalized articles, track your mood, and find local resources. Your journey starts now.',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'journey path',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.push('/dashboard');
    }
  };
  
  const progress = ((currentSlide + 1) / onboardingSlides.length) * 100;

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/50 p-4">
      <div className="w-full max-w-2xl">
        <Carousel
            opts={{
                align: "start",
                loop: false,
            }}
            onSelect={(api) => setCurrentSlide(api.selectedScrollSnap())}
            className="w-full"
        >
          <CarouselContent>
            {onboardingSlides.map((slide, index) => {
                const Icon = slide.icon;
                return (
                    <CarouselItem key={index}>
                        <Card>
                        <CardContent className="flex flex-col items-center justify-center p-6 md:p-12 text-center aspect-video md:aspect-[16/10]">
                            <div className='w-full h-48 relative rounded-lg overflow-hidden mb-6'>
                                <Image
                                    src={slide.image}
                                    alt={slide.title}
                                    layout="fill"
                                    objectFit="cover"
                                    data-ai-hint={slide.aiHint}
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
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
        
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-auto order-2 sm:order-1 flex items-center gap-2">
            {onboardingSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 w-2 rounded-full ${currentSlide === index ? 'bg-primary' : 'bg-muted'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          <Progress value={progress} className="w-full h-2 order-1 sm:order-2" />
          <Button onClick={handleNext} className="w-full sm:w-auto order-3" size="lg">
            {currentSlide === onboardingSlides.length - 1 ? "Go to Dashboard" : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
