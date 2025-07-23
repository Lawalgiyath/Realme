
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Bot, Utensils, Calendar, Loader2, Sparkles, Wand2, Mic, MicOff, Check, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { planDay, DailyPlannerOutput } from '@/ai/flows/daily-planner-flow';
import { correctText } from '@/ai/flows/text-correction-flow';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/app-context';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const plannerSchema = z.object({
  activities: z.string().min(10, 'Please describe your day in a bit more detail.'),
  mealTarget: z.string().min(3, 'Please specify a meal target.'),
  dietaryRestrictions: z.string().optional(),
});

type PlannerFormValues = z.infer<typeof plannerSchema>;

type ActiveField = 'activities' | 'mealTarget' | 'dietaryRestrictions';

export default function AiCoach() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [result, setResult] = useState<DailyPlannerOutput | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const activeFieldRef = useRef<ActiveField>('activities');
  
  const finalTranscriptRef = useRef('');
  
  const { addInteraction } = useApp();

  const form = useForm<PlannerFormValues>({
    resolver: zodResolver(plannerSchema),
    defaultValues: {
      activities: '',
      mealTarget: '',
      dietaryRestrictions: '',
    },
  });

  const { setValue, getValues, setFocus } = form;

  const handleTextCorrection = useCallback(async (field: ActiveField, text: string) => {
    if (!text.trim()) return;
    setIsCorrecting(true);
    try {
      const response = await correctText({ rawText: text });
      setValue(field, response.correctedText, { shouldValidate: true });
    } catch (error) {
      console.error('Text correction failed:', error);
      toast({
        variant: 'destructive',
        title: 'Correction Failed',
        description: 'Could not polish the transcribed text. Please review it manually.',
      });
      setValue(field, text, { shouldValidate: true });
    } finally {
      setIsCorrecting(false);
    }
  }, [setValue, toast]);

  const handleToggleListening = useCallback(async (field: ActiveField) => {
    if (isListening) {
      recognitionRef.current?.stop();
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
        setFocus(field);

        finalTranscriptRef.current = getValues(field) ? getValues(field) + ' ' : '';
        
        recognitionRef.current?.start();
        setIsListening(true);
    } catch (err: any) {
        console.error('Error getting user media', err);
        
        if (err.name === 'NotFoundError') {
             toast({
                variant: 'destructive',
                title: 'Microphone Not Found',
                description: 'No microphone was found on your device. Please connect a microphone and try again.',
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Microphone Access Required',
                description: 'Could not access the microphone. Please check your browser permissions.',
            });
        }
    }
  }, [getValues, setFocus, toast, isListening]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        const currentField = activeFieldRef.current;
        const baseValue = finalTranscriptRef.current;

        if(finalTranscript.length > 0) {
            finalTranscriptRef.current = baseValue + finalTranscript;
        }
        
        setValue(currentField, finalTranscriptRef.current + interimTranscript, { shouldValidate: false });
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === 'no-speech') {
            setIsListening(false);
            return;
        }

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
          const finalTranscript = finalTranscriptRef.current;
          const stoppedField = activeFieldRef.current;
                    
          if(finalTranscript.trim()){
              handleTextCorrection(stoppedField, finalTranscript);
          }

          // Auto-advance logic
          if (stoppedField === 'activities' && !getValues('mealTarget')) {
              handleToggleListening('mealTarget');
          } else if (stoppedField === 'mealTarget' && !getValues('dietaryRestrictions')) {
              handleToggleListening('dietaryRestrictions');
          }
      }
    }
  }, [setValue, toast, getValues, handleTextCorrection, handleToggleListening]);

  async function onSubmit(data: PlannerFormValues) {
    setLoading(true);
    setResult(null);
    try {
      const plan = await planDay(data);
      addInteraction({
        id: `plan-${Date.now()}`,
        type: 'Planner',
        title: 'Daily Plan Generated',
        content: `Plan for: ${data.activities.substring(0, 50)}...`,
        timestamp: new Date().toISOString(),
        data: { request: data, response: plan },
      });
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

  const MicButton = ({ field, isTextarea = false }: { field: ActiveField, isTextarea?: boolean }) => (
     <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => handleToggleListening(field)}
        className={cn('absolute right-2 z-10', isTextarea ? 'top-2' : 'top-1/2 -translate-y-1/2', isListening && activeFieldRef.current === field && 'text-destructive')}
        disabled={isCorrecting}
      >
        {isCorrecting && activeFieldRef.current === field ? <Loader2 className="h-5 w-5 animate-spin" /> : (isListening && activeFieldRef.current === field ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />)}
        <span className="sr-only">{isListening ? 'Stop listening' : 'Start listening'}</span>
      </Button>
  )

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
                  </FormLabel>
                   <FormControl>
                    <div className="relative">
                      <Textarea
                        placeholder="e.g., Morning meeting at 10am, finish project report, gym session in the evening..."
                        rows={5}
                        {...field}
                      />
                      <MicButton field="activities" isTextarea />
                    </div>
                  </FormControl>
                   <FormDescription>
                    Click the mic to speak. Aya will polish your transcription.
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
                        </FormLabel>
                        <FormControl>
                           <div className="relative">
                                <Input 
                                    placeholder="e.g., High protein, low carb, balanced" 
                                    {...field} 
                                />
                                <MicButton field="mealTarget" />
                            </div>
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
                        </FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Input 
                                    placeholder="e.g., Vegetarian, nut allergy" 
                                    {...field} 
                                />
                                <MicButton field="dietaryRestrictions" />
                            </div>
                        </FormControl>
                         <FormDescription>
                           Optional.
                         </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </div>
            <div className='flex justify-between items-center'>
                <Button type="submit" disabled={loading || isCorrecting} size="lg">
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
                {isCorrecting && (
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <Loader2 className='h-4 w-4 animate-spin' />
                        Polishing your words...
                    </div>
                )}
            </div>
          </form>
        </Form>
        
        {loading && !result && (
             <div className="flex flex-col items-center justify-center gap-4 text-center pt-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Aya is building your plan...</p>
            </div>
        )}

        {result && (
            <div className="mt-8 animate-in fade-in-50 space-y-6">
                 <Alert className="bg-green-50 border-green-200 text-green-800">
                    <Sparkles className="h-4 w-4 text-green-600" />
                    <AlertTitle className="font-headline text-green-900">Your Personalized Plan is Ready</AlertTitle>
                    <AlertDescription>
                        Here is a structured plan Aya created to help you have a productive and healthy day.
                    </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Daily Plan */}
                    <Card className="lg:col-span-3">
                         <CardHeader>
                            <CardTitle className='flex items-center gap-3'>
                                <Calendar className="h-6 w-6 text-primary" />
                                Daily Schedule
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {result.dailyPlan.map((item, index) => (
                                    <div key={index} className="flex items-start gap-4 p-3 rounded-lg border bg-background/50 relative">
                                        <div className="absolute top-4 left-4 h-full border-l-2 border-primary/20"></div>
                                        <div className="z-10 h-6 w-6 rounded-full bg-background flex items-center justify-center border-2 border-primary/30 mt-1">
                                            {item.isMeal ? <Utensils className="h-4 w-4 text-primary/80"/> : <Check className="h-4 w-4 text-primary"/>}
                                        </div>
                                        <div className='flex-1'>
                                            <p className="font-mono text-sm text-primary">{item.time}</p>
                                            <p className="font-medium text-foreground">{item.activity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Meal Plan */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-3'>
                                    <Utensils className="h-6 w-6 text-primary" />
                                    Meal Plan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-foreground">Breakfast</h4>
                                    <p className="text-muted-foreground">{result.mealPlan.breakfast}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground">Lunch</h4>
                                    <p className="text-muted-foreground">{result.mealPlan.lunch}</p>

                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground">Dinner</h4>
                                    <p className="text-muted-foreground">{result.mealPlan.dinner}</p>
                                </div>
                            </CardContent>
                        </Card>
                         <Card className='border-dashed bg-secondary/50 border-muted-foreground/20'>
                            <CardHeader>
                                <CardTitle className='text-base'>Edit Your Plan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className='text-sm text-muted-foreground mb-4'>Need to make a change? You can edit the generated plan by modifying your original input and regenerating it.</p>
                                <Button variant="secondary" size="sm" onClick={() => setResult(null)}>
                                    <Edit className='mr-2 h-4 w-4'/>
                                    Edit My Input
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
