"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Bot, Utensils, Calendar, Loader2, Sparkles, Wand2, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { planDay, DailyPlannerOutput } from '@/ai/flows/daily-planner-flow';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const plannerSchema = z.object({
  activities: z.string().min(10, 'Please describe your day in a bit more detail.'),
  mealTarget: z.string().min(3, 'Please specify a meal target.'),
  dietaryRestrictions: z.string().optional(),
});

type PlannerFormValues = z.infer<typeof plannerSchema>;

export default function AiCoach() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DailyPlannerOutput | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const form = useForm<PlannerFormValues>({
    resolver: zodResolver(plannerSchema),
    defaultValues: {
      activities: '',
      mealTarget: '',
      dietaryRestrictions: '',
    },
  });

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        form.setValue('activities', transcript);
      };
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        toast({
            variant: 'destructive',
            title: 'Voice Error',
            description: `An error occurred with voice recognition: ${event.error}`,
        });
        setIsListening(false);
      };
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [form, toast]);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
        toast({
            variant: 'destructive',
            title: 'Not Supported',
            description: 'Your browser does not support voice recognition.',
        });
        return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsListening(!isListening);
  };


  async function onSubmit(data: PlannerFormValues) {
    setLoading(true);
    setResult(null);
    try {
      const plan = await planDay(data);
      setResult(plan);
    } catch (error) {
      console.error('Failed to generate plan:', error);
      toast({
        variant: 'destructive',
        title: 'Oh no! Something went wrong.',
        description: 'Could not get a response from Aya. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10 border-2 border-primary/20">
                <Bot className="h-8 w-8 text-primary" />
            </div>
            <div>
                <CardTitle>Daily Planner with Aya</CardTitle>
                <CardDescription>
                Let Aya, your personal guide, organize your day and plan your meals for success.
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="activities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">What's on your schedule today?</FormLabel>
                  <FormControl>
                    <div className="relative">
                        <Textarea
                        placeholder="e.g., Morning meeting at 10am, finish project report, gym session in the evening..."
                        rows={5}
                        {...field}
                        />
                        <Button
                            type="button"
                            size="icon"
                            variant={isListening ? 'destructive' : 'ghost'}
                            className="absolute bottom-2 right-2"
                            onClick={handleMicClick}
                        >
                            {isListening ? <MicOff /> : <Mic />}
                        </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    List your tasks, appointments, and anything else you need to do. You can also use the microphone.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <FormField
                    control={form.control}
                    name="mealTarget"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-base">What's your meal target?</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., High protein, low carb, balanced" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="dietaryRestrictions"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-base">Any dietary restrictions?</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Vegetarian, nut allergy" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </div>
            <Button type="submit" disabled={loading} size="lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Planning Your Day...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate My Plan
                </>
              )}
            </Button>
          </form>
        </Form>
        
        {loading && (
             <div className="flex flex-col items-center justify-center gap-4 text-center pt-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Aya is building your plan...</p>
            </div>
        )}

        {result && (
          <Alert className="mt-8 bg-secondary border-secondary-foreground/20 animate-in fade-in-50">
            <Sparkles className="h-4 w-4 text-primary" />
            <AlertTitle className="font-headline">Your Personalized Plan from Aya</AlertTitle>
            <AlertDescription className="mt-4 space-y-6 text-foreground">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Daily Plan */}
                    <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Daily Schedule</h3>
                        <div className="space-y-2">
                            {result.dailyPlan.map((item, index) => (
                                <div key={index} className="flex items-start gap-3 p-2 rounded-md bg-background/50">
                                    <div className="font-mono text-sm text-primary pt-0.5">{item.time}</div>
                                    <p className="text-sm">{item.activity}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Meal Plan */}
                    <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2"><Utensils className="h-5 w-5 text-primary" /> Meal Plan</h3>
                        <div className="space-y-3">
                            <div>
                                <h4 className="font-medium text-sm">Breakfast</h4>
                                <p className="text-sm text-muted-foreground">{result.mealPlan.breakfast}</p>
                            </div>
                             <div>
                                <h4 className="font-medium text-sm">Lunch</h4>
                                <p className="text-sm text-muted-foreground">{result.mealPlan.lunch}</p>
                            </div>
                             <div>
                                <h4 className="font-medium text-sm">Dinner</h4>
                                <p className="text-sm text-muted-foreground">{result.mealPlan.dinner}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
