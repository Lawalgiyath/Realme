"use client";

import type { PersonalizedContentOutput } from '@/ai/flows/personalized-content';
import type { MentalHealthAssessmentOutput } from '@/ai/flows/mental-health-assessment';
import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect } from 'react';

export interface Mood {
  mood: 'Happy' | 'Calm' | 'Okay' | 'Anxious' | 'Sad';
  date: string;
}

export interface Goal {
  id: string;
  text: string;
  completed: boolean;
}

export interface User {
  name: string;
  email: string;
  phone: string;
  avatar: string;
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
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const animalAvatars = [
  "bear", "cat", "dog", "fox", "koala", "lion", "panda", "penguin", "rabbit", "tiger"
];

function getRandomAvatar() {
    const animal = animalAvatars[Math.floor(Math.random() * animalAvatars.length)];
    return `https://source.unsplash.com/100x100/?${animal}`;
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [assessmentResult, setAssessmentResult] = useState<MentalHealthAssessmentOutput | null>(null);
  const [personalizedContent, setPersonalizedContent] = useState<PersonalizedContentOutput | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('realme-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('realme-user');
    } finally {
        setLoading(false);
    }
  }, []);

  const login = (userData: Omit<User, 'avatar'>) => {
    const newUser: User = { ...userData, avatar: getRandomAvatar() };
    localStorage.setItem('realme-user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('realme-user');
    setUser(null);
    setAssessmentResult(null);
    setPersonalizedContent(null);
    setGoals([]);
    setMoods([]);
  };

  const value = useMemo(() => ({
    moods,
    setMoods,
    goals,
    setGoals,
    assessmentResult,
    setAssessmentResult,
    personalizedContent,
    setPersonalizedContent,
    user,
    setUser,
    login,
    logout,
    loading
  }), [moods, goals, assessmentResult, personalizedContent, user, loading]);

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
