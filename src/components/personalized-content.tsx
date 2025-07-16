"use client";

import { useState } from 'react';
import Image from 'next/image';
import { BookOpen, BrainCircuit, Loader2, Sparkles, Wind } from 'lucide-react';
import { personalizedContentSuggestions } from '@/ai/flows/personalized-content';
import { useApp } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function PersonalizedContent() {
  const { assessmentResult, personalizedContent, setPersonalizedContent } = useApp();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateContent = async () => {
    if (!assessmentResult) {
      toast({
        variant: 'destructive',
        title: 'Assessment Required',
        description: 'Please complete the assessment first to get personalized content.',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await personalizedContentSuggestions({
        assessmentResults: assessmentResult.insights,
        preferences: 'General mental wellness, stress reduction, and mindfulness.',
      });
      setPersonalizedContent(result);
    } catch (error) {
      console.error('Failed to generate content:', error);
      toast({
        variant: 'destructive',
        title: 'Oh no! Something went wrong.',
        description: 'Could not generate personalized content. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!assessmentResult) {
    return (
      <div className="text-center text-muted-foreground p-8 bg-secondary rounded-lg">
        <p>Complete the AI assessment to unlock your personalized content plan.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Generating your personalized plan...</p>
      </div>
    );
  }

  if (!personalizedContent) {
    return (
      <div className="text-center">
        <Button onClick={handleGenerateContent} disabled={loading}>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate My Content Plan
        </Button>
      </div>
    );
  }
  
  return (
    <div className="grid gap-6 md:grid-cols-3">
        <Card>
            <CardContent className="p-4 md:p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><BookOpen className="text-primary h-5 w-5"/> Suggested Articles</h3>
                <ul className="space-y-4">
                    {personalizedContent.articles.map((article, i) => (
                        <li key={i} className="flex items-start gap-4">
                            <Image data-ai-hint="wellness article" src="https://placehold.co/100x100.png" alt={article} width={60} height={60} className="rounded-lg aspect-square object-cover" />
                            <div>
                                <p className="font-medium text-sm leading-snug">{article}</p>
                                <a href="#" className="text-xs text-primary hover:underline">Read more</a>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
        <Card>
            <CardContent className="p-4 md:p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Wind className="text-primary h-5 w-5"/> Guided Meditations</h3>
                <ul className="space-y-4">
                    {personalizedContent.meditations.map((meditation, i) => (
                        <li key={i} className="flex items-start gap-4">
                            <Image data-ai-hint="meditation nature" src="https://placehold.co/100x100.png" alt={meditation} width={60} height={60} className="rounded-lg aspect-square object-cover" />
                            <div>
                                <p className="font-medium text-sm leading-snug">{meditation}</p>
                                <a href="#" className="text-xs text-primary hover:underline">Start session</a>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
        <Card>
            <CardContent className="p-4 md:p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><BrainCircuit className="text-primary h-5 w-5"/> Mindfulness Exercises</h3>
                <ul className="space-y-4">
                    {personalizedContent.exercises.map((exercise, i) => (
                         <li key={i} className="flex items-start gap-4">
                            <Image data-ai-hint="mindfulness yoga" src="https://placehold.co/100x100.png" alt={exercise} width={60} height={60} className="rounded-lg aspect-square object-cover" />
                            <div>
                                <p className="font-medium text-sm leading-snug">{exercise}</p>
                                <a href="#" className="text-xs text-primary hover:underline">Try it now</a>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    </div>
  );
}
