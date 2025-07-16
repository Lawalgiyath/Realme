"use client";

import { useMemo } from 'react';
import { Line, LineChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Mood } from '@/context/app-context';
import { useApp } from '@/context/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { format, subDays } from 'date-fns';

const moodToValue = {
  Happy: 5,
  Calm: 4,
  Okay: 3,
  Anxious: 2,
  Sad: 1,
};

const valueToMood = ['Sad', 'Anxious', 'Okay', 'Calm', 'Happy'];

export default function ProgressChart() {
  const { moods } = useApp();

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(new Date(), i);
        return format(d, 'yyyy-MM-dd');
    }).reverse();

    return last7Days.map(date => {
      const moodEntry = moods.find(m => m.date === date);
      return {
        date: format(new Date(date), 'MMM d'),
        mood: moodEntry ? moodToValue[moodEntry.mood] : null,
        moodName: moodEntry ? moodEntry.mood : 'Not logged'
      };
    });
  }, [moods]);
  
  const chartConfig = {
    mood: {
      label: 'Mood',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
          <Tooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, props) => (
                  <div className="flex flex-col">
                    <span>{props.payload.moodName}</span>
                  </div>
                )}
                labelFormatter={(label) => `Mood on ${label}`}
                indicator="dot"
              />
            }
          />
          <Line
            dataKey="mood"
            type="monotone"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 4, fill: "hsl(var(--primary))", stroke: 'hsl(var(--background))', strokeWidth: 2 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
