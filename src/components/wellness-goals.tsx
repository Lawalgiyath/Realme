"use client";

import { useState } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import { useApp } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export default function WellnessGoals() {
  const { goals, setGoals } = useApp();
  const [newGoal, setNewGoal] = useState('');

  const handleAddGoal = () => {
    if (newGoal.trim()) {
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

  const removeGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id));
  };
  
  const completedGoals = goals.filter((goal) => goal.completed).length;
  const progress = goals.length > 0 ? (completedGoals / goals.length) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wellness Goals</CardTitle>
        <CardDescription>Set and track your personal goals for mental wellness.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input 
            type="text" 
            placeholder="e.g., Meditate for 5 minutes"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
          />
          <Button onClick={handleAddGoal}><Plus className="mr-2 h-4 w-4" />Add Goal</Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-base font-medium text-primary">Progress</span>
              <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>

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
      </CardContent>
    </Card>
  );
}
