"use client";

import { useState, useEffect } from 'react';
import { Check, Plus, Trash2, Sparkles, Loader2, BookOpen, Wind, BrainCircuit } from 'lucide-react';
import { useApp } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { personalizedContentSuggestions } from '@/ai/flows/personalized-content';
import Image from 'next/image';

export default function WellnessGoals() {
  const { goals, setGoals, assessmentResult, personalizedContent, setPersonalizedContent, addAchievement } = useApp();
  const [newGoal, setNewGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      addAchievement('firstGoal');
      setGoals([
        ...goals,
        { id: Date.now().toString(), text: newGoal.trim(), completed: false },
      ]);
      setNewGoal('');
    }
  };

  const toggleGoal = (id: string) => {
    setGoals(
      goals.map((goal) =>
        goal.id === id ? { ...goal, completed: !goal.completed } : goal
      )
    );
  };

  useEffect(() => {
    const completedGoalsCount = goals.filter(g => g.completed).length;
    if (completedGoalsCount >= 5) {
        addAchievement('fiveGoalsDone');
    }
    if (completedGoalsCount >= 10) {
        addAchievement('tenGoalsDone');
    }
  }, [goals, addAchievement]);

  const removeGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id));
  };

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
      addAchievement('contentGenerated');
      const result = await personalizedContentSuggestions({
        assessmentResults: assessmentResult.insights,
        preferences: goals.map(g => g.text).join(', ') || 'General mental wellness, stress reduction, and mindfulness.',
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
  
  const completedGoals = goals.filter((goal) => goal.completed).length;
  const progress = goals.length > 0 ? (completedGoals / goals.length) * 100 : 0;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Goals & Content</CardTitle>
        <CardDescription>Set wellness goals and get personalized content suggestions from Aya to help you achieve them.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 flex-1">
        <div className="flex w-full items-center space-x-2">
          <Input 
            type="text" 
            placeholder="e.g., Meditate for 5 minutes"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
          />
          <Button onClick={handleAddGoal}><Plus className="mr-2 h-4 w-4" />Add</Button>
        </div>
        
        <div className="space-y-4">
          {goals.length > 0 && (
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-base font-medium text-primary">Progress</span>
                <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          <div className="space-y-2">
            {goals.length > 0 ? (
              goals.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <button onClick={() => toggleGoal(goal.id)} className="flex items-center gap-3 flex-1">
                    <div className={cn("h-6 w-6 rounded-full border-2 border-primary flex items-center justify-center transition-colors", goal.completed && "bg-primary")}>
                      {goal.completed && <Check className="h-4 w-4 text-primary-foreground" />}
                    </div>
                    <span className={cn("text-secondary-foreground", goal.completed && "line-through text-muted-foreground")}>
                      {goal.text}
                    </span>
                  </button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeGoal(goal.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No goals set yet. Add one to get started!</p>
            )}
          </div>
        </div>

        <div className="border-t pt-6">
            <CardHeader className="p-0 mb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="text-primary h-5 w-5" />{' '}
                Your Content Plan from Aya
                </CardTitle>
                <CardDescription>
                Suggestions based on your assessment, goals, and mood.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {!assessmentResult ? (
                    <div className="text-center text-muted-foreground p-8 bg-secondary rounded-lg">
                        <p>Complete the assessment to unlock your personalized content plan.</p>
                    </div>
                ) : loading ? (
                     <div className="flex justify-center items-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="ml-4 text-muted-foreground">Generating your plan...</p>
                    </div>
                ) : !personalizedContent ? (
                    <div className="text-center">
                        <Button onClick={handleGenerateContent} disabled={loading}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate My Content Plan
                        </Button>
                    </div>
                ) : (
                     <div className="grid gap-6 md:grid-cols-1">
                        <Card>
                            <CardContent className="p-4 md:p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><BookOpen className="text-primary h-5 w-5"/> Articles</h3>
                                <ul className="space-y-4">
                                    {personalizedContent.articles.map((article, i) => (
                                        <li key={i} className="flex items-start gap-4">
                                            <Image data-ai-hint="wellness article" src="https://placehold.co/100x100.png" alt={article} width={60} height={60} className="rounded-lg aspect-square object-cover" />
                                            <div>
                                                <p className="font-medium text-sm leading-snug">{article}</p>
                                                <a href={`https://www.google.com/search?q=${encodeURIComponent(article)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">Read more</a>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 md:p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Wind className="text-primary h-5 w-5"/> Meditations</h3>
                                <ul className="space-y-4">
                                    {personalizedContent.meditations.map((meditation, i) => (
                                        <li key={i} className="flex items-start gap-4">
                                            <Image data-ai-hint="meditation nature" src="https://placehold.co/100x100.png" alt={meditation} width={60} height={60} className="rounded-lg aspect-square object-cover" />
                                            <div>
                                                <p className="font-medium text-sm leading-snug">{meditation}</p>
                                                <a href={`https://www.youtube.com/results?search_query=guided+meditation+${encodeURIComponent(meditation)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">Start session</a>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 md:p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><BrainCircuit className="text-primary h-5 w-5"/> Exercises</h3>
                                <ul className="space-y-4">
                                    {personalizedContent.exercises.map((exercise, i) => (
                                        <li key={i} className="flex items-start gap-4">
                                            <Image data-ai-hint="mindfulness yoga" src="https://placehold.co/100x100.png" alt={exercise} width={60} height={60} className="rounded-lg aspect-square object-cover" />
                                            <div>
                                                <p className="font-medium text-sm leading-snug">{exercise}</p>
                                                <a href={`https://www.google.com/search?q=${encodeURIComponent(exercise)} exercise`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">Try it now</a>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </CardContent>
        </div>
      </CardContent>
    </Card>
  );
}
