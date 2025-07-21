"use client";

import { useState, useRef, useEffect } from 'react';
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
import { cn } from '@/lib/utils';
import { useApp } from '@/context/app-context';

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
  const recognitionRef = useRef<any>(null);
  const activeFieldRef = useRef<'activities' | 'mealTarget' | 'dietaryRestrictions'>('activities');
  const { addInteraction } = useApp();

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

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        
        const lowerCaseTranscript = finalTranscript.toLowerCase();

        if (lowerCaseTranscript.includes('dietary restrictions')) {
            const cleanTranscript = finalTranscript.replace(/dietary restrictions/i, '').trim();
             if (cleanTranscript) {
              form.setValue(activeFieldRef.current, (form.getValues(activeFieldRef.current) || '') + cleanTranscript + ' ');
            }
            form.setFocus('dietaryRestrictions');
            activeFieldRef.current = 'dietaryRestrictions';
        } else if (lowerCaseTranscript.includes('meal plan')) {
            const cleanTranscript = finalTranscript.replace(/meal plan/i, '').trim();
            if (cleanTranscript) {
              form.setValue(activeFieldRef.current, (form.getValues(activeFieldRef.current) || '') + cleanTranscript + ' ');
            }
            form.setFocus('mealTarget');
            activeFieldRef.current = 'mealTarget';
        } else {
             form.setValue(activeFieldRef.current, (form.getValues(activeFieldRef.current) || '') + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
         if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            toast({
                variant: 'destructive',
                title: 'Microphone Access Denied',
                description: 'Please enable microphone permissions in your browser settings to use voice input.',
            });
        }
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
          setIsListening(false);
      }

    }
  }, [form, toast]);

  const handleToggleListening = async (field: 'activities' | 'mealTarget' | 'dietaryRestrictions') => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (!recognitionRef.current) {
        toast({
            variant: 'destructive',
            title: 'Browser Not Supported',
            description: 'Your browser does not support voice recognition.',
        });
        return;
    }

    try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        activeFieldRef.current = field;
        recognitionRef.current?.start();
        setIsListening(true);
    } catch (err) {
        console.error('Error getting user media', err);
        toast({
            variant: 'destructive',
            title: 'Microphone Access Required',
            description: 'Could not access the microphone. Please check your browser permissions.',
        });
    }
  };

  async function onSubmit(data: PlannerFormValues) {
    setLoading(true);
    setResult(null);
    try {
      const plan = await planDay(data);
      setResult(plan);
      addInteraction({
        id: `plan-${Date.now()}`,
        type: 'Planner',
        title: 'Daily Plan Generated',
        content: `Plan for: ${data.activities.substring(0, 50)}...`,
        timestamp: new Date().toISOString(),
        data: { request: data, response: plan },
      });

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
                   <FormLabel className="text-base flex items-center justify-between">
                    What's on your schedule today?
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleListening('activities')}
                        className={cn(isListening && activeFieldRef.current === 'activities' && 'text-destructive')}
                        >
                        {isListening && activeFieldRef.current === 'activities' ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                        <span className="sr-only">{isListening ? 'Stop listening' : 'Start listening'}</span>
                    </Button>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                    placeholder="e.g., Morning meeting at 10am, finish project report, gym session in the evening..."
                    rows={5}
                    onFocus={() => activeFieldRef.current = 'activities'}
                    {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    List your tasks, then say "meal plan" to continue, or "dietary restrictions" to add preferences.
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
                        <FormLabel className="text-base flex items-center justify-between">What's your meal target?
                             <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleListening('mealTarget')}
                                className={cn(isListening && activeFieldRef.current === 'mealTarget' && 'text-destructive')}
                                >
                                {isListening && activeFieldRef.current === 'mealTarget' ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                <span className="sr-only">{isListening ? 'Stop listening' : 'Start listening'}</span>
                            </Button>
                        </FormLabel>
                        <FormControl>
                            <Input 
                                placeholder="e.g., High protein, low carb, balanced" 
                                onFocus={() => activeFieldRef.current = 'mealTarget'}
                                {...field} 
                            />
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
                        <FormLabel className="text-base flex items-center justify-between">Any dietary restrictions?
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleListening('dietaryRestrictions')}
                                className={cn(isListening && activeFieldRef.current === 'dietaryRestrictions' && 'text-destructive')}
                                >
                                {isListening && activeFieldRef.current === 'dietaryRestrictions' ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                <span className="sr-only">{isListening ? 'Stop listening' : 'Start listening'}</span>
                            </Button>
                        </FormLabel>
                        <FormControl>
                            <Input 
                                placeholder="e.g., Vegetarian, nut allergy" 
                                onFocus={() => activeFieldRef.current = 'dietaryRestrictions'}
                                {...field} 
                            />
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
