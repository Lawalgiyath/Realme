"use client";

import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { mentalHealthAssessment } from '@/ai/flows/mental-health-assessment';
import { useApp } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const assessmentSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      answer: z.string().min(1, 'Please select an option.'),
    })
  ),
});

type AssessmentFormValues = z.infer<typeof assessmentSchema>;

const initialQuestions = [
  'Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?',
  'How would you rate your sleep quality over the past month?',
  'Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?',
  'How connected do you feel to others (friends, family, community)?',
];

const answerOptions: Record<number, string[]> = {
  0: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
  1: ['Very good', 'Fairly good', 'Fairly bad', 'Very bad'],
  2: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
  3: ['Very connected', 'Somewhat connected', 'Not very connected', 'Not at all connected'],
};


export default function Assessment() {
  const { toast } = useToast();
  const { setAssessmentResult, assessmentResult } = useApp();
  const [loading, setLoading] = useState(false);

  const form = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      questions: initialQuestions.map((q) => ({ question: q, answer: '' })),
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
        answers: data.questions.map(q => `${q.question}: ${q.answer}`),
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
        <CardTitle>AI Mental Health Assessment</CardTitle>
        <CardDescription>
          Answer a few questions to get personalized insights and recommendations. Your answers are private and secure.
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
                    <FormLabel className="text-base">{initialQuestions[index]}</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        {answerOptions[index].map((option) => (
                          <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value={option} />
                            </FormControl>
                            <FormLabel className="font-normal">{option}</FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Get My Assessment
                </>
              )}
            </Button>
          </form>
        </Form>

        {loading && (
          <div className="mt-8 flex flex-col items-center justify-center gap-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Our AI is analyzing your responses... This may take a moment.</p>
          </div>
        )}

        {assessmentResult && (
          <div className="mt-8 space-y-6">
             <Alert className="bg-secondary border-secondary-foreground/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <AlertTitle className="font-headline">Your Personalized Results</AlertTitle>
              <AlertDescription className="space-y-4 mt-2">
                <div>
                  <h3 className="font-semibold text-foreground">Insights</h3>
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
