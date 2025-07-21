"use client";

import { useEffect } from 'react';
import { Smile, Meh, Frown, Annoyed, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/app-context';
import { cn } from '@/lib/utils';
import { subDays, format } from 'date-fns';

const moods = [
  { name: 'Happy', icon: Smile, color: 'text-green-500' },
  { name: 'Calm', icon: Wind, color: 'text-blue-500' },
  { name: 'Okay', icon: Meh, color: 'text-yellow-500' },
  { name: 'Anxious', icon: Annoyed, color: 'text-orange-500' },
  { name: 'Sad', icon: Frown, color: 'text-purple-500' },
] as const;

type MoodName = typeof moods[number]['name'];

export default function MoodTracker() {
  const { setMoods, moods: moodData, addAchievement } = useApp();
  
  const today = new Date().toISOString().split('T')[0];
  const moodForToday = moodData.find(m => m.date === today);

  const handleMoodSelect = (mood: MoodName) => {
    setMoods(prevMoods => {
        const otherMoods = prevMoods.filter(m => m.date !== today);
        return [...otherMoods, { mood, date: today }];
    });
  };

  useEffect(() => {
    const checkMoodStreak = (days: number) => {
      if (moodData.length < days) return false;
      const recentDates = Array.from({ length: days }).map((_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'));
      return recentDates.every(date => moodData.some(mood => mood.date === date));
    };

    if (checkMoodStreak(7)) {
      addAchievement('moodWeek');
    }
    if (checkMoodStreak(30)) {
      addAchievement('moodMonth');
    }
  }, [moodData, addAchievement]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>How are you feeling?</CardTitle>
        <CardDescription>Log your daily mood.</CardDescription>
      </CardHeader>
      <CardContent>
        {moodForToday ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-4 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground">You've logged your mood today as:</p>
            <p className="text-3xl font-bold font-headline text-primary">{moodForToday.mood}</p>
            <Button variant="outline" onClick={() => handleMoodSelect(moodForToday.mood)}>Change Mood</Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {moods.map(({ name, icon: Icon, color }) => (
              <Button
                key={name}
                variant="outline"
                className="flex flex-col h-20 gap-2"
                onClick={() => handleMoodSelect(name)}
              >
                <Icon className={cn("h-8 w-8", color)} />
                <span className="text-xs">{name}</span>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
