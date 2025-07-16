"use client";

import type { PersonalizedContentOutput } from '@/ai/flows/personalized-content';
import type { MentalHealthAssessmentOutput } from '@/ai/flows/mental-health-assessment';
import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';

export interface Mood {
  mood: 'Happy' | 'Calm' | 'Okay' | 'Anxious' | 'Sad';
  date: string;
}

export interface Goal {
  id: string;
  text: string;
  completed: boolean;
}

interface AppContextType {
  moods: Mood[];
  setMoods: React.Dispatch<React.SetStateAction<Mood[]>>;
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  assessmentResult: MentalHealthAssessmentOutput | null;
  setAssessmentResult: React.Dispatch<React.SetStateAction<MentalHealthAssessmentOutput | null>>;
  personalizedContent: PersonalizedContentOutput | null;
  setPersonalizedContent: React.Dispatch<React.SetStateAction<PersonalizedContentOutput | null>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [assessmentResult, setAssessmentResult] = useState<MentalHealthAssessmentOutput | null>(null);
  const [personalizedContent, setPersonalizedContent] = useState<PersonalizedContentOutput | null>(null);
  
  const today = new Date().toISOString().split('T')[0];
  const hasMoodForToday = moods.some(m => m.date === today);

  const value = useMemo(() => ({
    moods,
    setMoods,
    goals,
    setGoals,
    assessmentResult,
    setAssessmentResult,
    personalizedContent,
    setPersonalizedContent,
    hasMoodForToday,
  }), [moods, goals, assessmentResult, personalizedContent, hasMoodForToday]);

  return (
    <AppContext.Provider value={value as AppContextType}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
