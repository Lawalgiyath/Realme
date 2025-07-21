"use client";

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { mentalHealthAssessment } from '@/ai/flows/mental-health-assessment';
import { useApp } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from './ui/textarea';

const assessmentSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      answer: z.string().min(10, 'Please provide a more detailed answer (at least 10 characters).'),
    })
  ),
});

type AssessmentFormValues = z.infer<typeof assessmentSchema>;

const initialQuestions = [
  { 
    question: 'Over the last two weeks, how have you been feeling in general? Describe your overall mood and energy levels.',
    placeholder: 'e.g., I\'ve been feeling quite down and tired most days...'
  },
  { 
    question: 'Think about your sleep recently. Are you having any trouble falling asleep, staying asleep, or are you sleeping too much?',
    placeholder: 'e.g., I find it hard to switch off my brain at night...'
  },
  { 
    question: 'In the past two weeks, have you felt nervous, anxious, or on edge? Describe what that feels like for you.',
    placeholder: 'e.g., I get a knot in my stomach when I think about work...'
  },
  { 
    question: 'How connected have you felt to other people (like friends, family, or your community) lately?',
    placeholder: 'e.g., I feel a bit distant from everyone right now...'
  },
];


export default function Assessment() {
  const { toast } = useToast();
  const { setAssessmentResult, assessmentResult } = useApp();
  const [loading, setLoading] = useState(false);

  const form = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      questions: initialQuestions.map((q) => ({ question: q.question, answer: '' })),
    },
  });

  const { fields } = useFieldArray({
    name: 'questions',
    control: form.control,
  });

  async function onSubmit(data: AssessmentFormValues) {
    setLoading(true);
    setAssessmentResult(null);
    try {
      const result = await mentalHealthAssessment({
        answers: data.questions.map(q => ({ question: q.question, answer: q.answer })),
      });
      setAssessmentResult(result);
      toast({
        title: 'Assessment Complete!',
        description: 'Your personalized insights are ready.',
      });
    } catch (error) {
      console.error('Assessment failed:', error);
      toast({
        variant: 'destructive',
        title: 'Oh no! Something went wrong.',
        description: 'There was a problem with your assessment. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalized Assessment</CardTitle>
        <CardDescription>
          Answer a few open-ended questions to get personalized insights from Aya. Your answers are private and secure. The more detail you provide, the better Aya can understand your needs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {fields.map((field, index) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`questions.${index}.answer`}
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base">{initialQuestions[index].question}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={initialQuestions[index].placeholder}
                        rows={4}
                        className="resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button type="submit" disabled={loading} size="lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Your Responses...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Get My Personalized Insights
                </>
              )}
            </Button>
          </form>
        </Form>

        {loading && (
          <div className="mt-8 flex flex-col items-center justify-center gap-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Aya is analyzing your responses... This may take a moment.</p>
          </div>
        )}

        {assessmentResult && (
          <div className="mt-8 space-y-6">
             <Alert className="bg-secondary border-secondary-foreground/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <AlertTitle className="font-headline">Your Personalized Results</AlertTitle>
              <AlertDescription className="space-y-4 mt-2">
                <div>
                  <h3 className="font-semibold text-foreground">Insights from Aya</h3>
                  <p>{assessmentResult.insights}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Recommendations</h3>
                  <p>{assessmentResult.recommendations}</p>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
