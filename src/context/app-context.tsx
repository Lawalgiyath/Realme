
"use client";

import type { PersonalizedContentOutput } from '@/ai/flows/personalized-content';
import type { MentalHealthAssessmentOutput } from '@/ai/flows/mental-health-assessment';
import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, type User as FirebaseUser } from 'firebase/auth';

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
  uid: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
}

export type AchievementKey = 'firstGoal' | 'assessmentComplete' | 'firstJournal' | 'contentGenerated' | 'fiveGoalsDone' | 'moodWeek' | 'firstResource' | 'tenGoalsDone' | 'worryJarUse' | 'moodMonth';

export interface Achievement {
  id: AchievementKey;
  name: string;
  description: string;
  unlocked: boolean;
}

export interface Interaction {
    id: string;
    type: 'Journal' | 'Worry Jar' | 'Assessment' | 'Planner';
    title: string;
    content: string;
    timestamp: string;
    data: any;
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
  signup: (name: string, email: string, phone: string, password: string) => Promise<FirebaseUser>;
  login: (email: string, password: string) => Promise<FirebaseUser>;
  logout: () => Promise<void>;
  loading: boolean;
  achievements: Achievement[];
  addAchievement: (key: AchievementKey) => void;
  interactions: Interaction[];
  addInteraction: (interaction: Interaction) => void;
  unlockedAchievement: Achievement | null;
  clearUnlockedAchievement: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const animalAvatars = [
  "bear", "cat", "dog", "fox", "koala", "lion", "panda", "penguin", "rabbit", "tiger"
];

const initialAchievements: Achievement[] = [
    { id: 'firstGoal', name: 'Goal Setter', description: 'You set your first wellness goal!', unlocked: false },
    { id: 'assessmentComplete', name: 'Self-Explorer', description: 'You completed your first assessment.', unlocked: false },
    { id: 'firstJournal', name: 'Reflective Mind', description: 'You wrote your first journal entry.', unlocked: false },
    { id: 'worryJarUse', name: 'Worry Whittler', description: 'You used the Worry Jar for the first time.', unlocked: false },
    { id: 'contentGenerated', name: 'Pathfinder', description: 'You generated your first personalized content plan.', unlocked: false },
    { id: 'fiveGoalsDone', name: 'Goal Getter', description: 'Completed 5 personal goals. Amazing!', unlocked: false },
    { id: 'tenGoalsDone', name: 'Goal Master', description: 'Completed 10 personal goals. Incredible!', unlocked: false },
    { id: 'moodWeek', name: 'Mood Mapper', description: 'Logged your mood for 7 days in a row.', unlocked: false },
    { id: 'moodMonth', name: 'Mood Marathoner', description: 'Logged your mood for 30 days. That is commitment!', unlocked: false },
    { id: 'firstResource', name: 'Support Seeker', description: 'Viewed the local resources directory.', unlocked: false },
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
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const currentUser: User = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            avatar: firebaseUser.photoURL,
        };
        setUser(currentUser);
        // Load user-specific data from local storage
        try {
             const storedAchievements = localStorage.getItem(`realme-achievements-${currentUser.email}`);
            if(storedAchievements) setAchievements(JSON.parse(storedAchievements));
            
            const storedInteractions = localStorage.getItem(`realme-interactions-${currentUser.email}`);
            if(storedInteractions) setInteractions(JSON.parse(storedInteractions));
        } catch (e) {
            console.error("Failed to load user data from localStorage", e)
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (name: string, email: string, phone: string, password: string): Promise<FirebaseUser> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const avatarUrl = getRandomAvatar();
    await updateProfile(userCredential.user, {
      displayName: name,
      photoURL: avatarUrl,
    });
    
    // We can store phone in Firestore if needed, as it's not part of the default FirebaseUser profile
    
    const newUser: User = {
        uid: userCredential.user.uid,
        name,
        email,
        avatar: avatarUrl
    };
    setUser(newUser);
    // Reset data for new user
    setAchievements(initialAchievements);
    setInteractions([]);
    localStorage.removeItem(`realme-achievements-${email}`);
    localStorage.removeItem(`realme-interactions-${email}`);

    return userCredential.user;
  };

  const login = async (email: string, password: string): Promise<FirebaseUser> => {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
  };

  const logout = async () => {
    await signOut(auth);
    // Clear all app state on logout
    setAssessmentResult(null);
    setPersonalizedContent(null);
    setGoals([]);
    setMoods([]);
    setAchievements(initialAchievements);
    setInteractions([]);
  };

  const addAchievement = useCallback((key: AchievementKey) => {
    setAchievements(prev => {
        const achievement = prev.find(a => a.id === key);
        // Only unlock and show popup if it's not already unlocked
        if (achievement && !achievement.unlocked) {
            setUnlockedAchievement({ ...achievement, unlocked: true });
            const newState = prev.map(a => a.id === key ? { ...a, unlocked: true } : a);
            if (user) {
                localStorage.setItem(`realme-achievements-${user.email}`, JSON.stringify(newState));
            }
            return newState;
        }
        return prev; // Return previous state if already unlocked
    });
  }, [user]);

  const addInteraction = useCallback((interaction: Interaction) => {
    setInteractions(prev => {
        const newState = [interaction, ...prev];
        if (user) {
            localStorage.setItem(`realme-interactions-${user.email}`, JSON.stringify(newState));
        }
        return newState;
    });
  }, [user]);

  const clearUnlockedAchievement = () => {
    setUnlockedAchievement(null);
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
    signup,
    login,
    logout,
    loading,
    achievements,
    addAchievement,
    interactions,
    addInteraction,
    unlockedAchievement,
    clearUnlockedAchievement,
  }), [moods, goals, assessmentResult, personalizedContent, user, loading, achievements, addAchievement, interactions, addInteraction, unlockedAchievement]);

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
