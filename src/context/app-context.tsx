
"use client";

import type { PersonalizedContentOutput } from '@/ai/flows/personalized-content';
import type { MentalHealthAssessmentOutput } from '@/ai/flows/mental-health-assessment';
import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, type User as FirebaseUser, GoogleAuthProvider, signInWithPopup, signInAnonymously } from 'firebase/auth';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { DailyPlannerOutput } from '@/ai/flows/daily-planner-flow';

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
  isAnonymous: boolean;
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

// This defines the structure of the data stored in Firestore for each user.
interface UserData {
    moods: Mood[];
    goals: Goal[];
    assessmentResult: MentalHealthAssessmentOutput | null;
    personalizedContent: PersonalizedContentOutput | null;
    achievements: Achievement[];
    interactions: Interaction[];
    dailyPlan?: DailyPlannerOutput | null;
    dailyPlanTimestamp?: string | null;
}


interface AppContextType {
  moods: Mood[];
  setMoods: (moods: Mood[]) => void;
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
  assessmentResult: MentalHealthAssessmentOutput | null;
  setAssessmentResult: (result: MentalHealthAssessmentOutput | null) => void;
  personalizedContent: PersonalizedContentOutput | null;
  setPersonalizedContent: (content: PersonalizedContentOutput | null) => void;
  user: User | null;
  signup: (name: string, email: string, password: string) => Promise<FirebaseUser>;
  login: (email: string, password: string) => Promise<FirebaseUser>;
  loginWithGoogle: () => Promise<FirebaseUser>;
  loginAnonymously: () => Promise<FirebaseUser>;
  logout: () => Promise<void>;
  loading: boolean;
  achievements: Achievement[];
  addAchievement: (key: AchievementKey) => void;
  interactions: Interaction[];
  addInteraction: (interaction: Interaction) => void;
  unlockedAchievement: Achievement | null;
  clearUnlockedAchievement: () => void;
  dailyPlan: DailyPlannerOutput | null;
  setDailyPlan: (plan: DailyPlannerOutput | null) => void;
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

const initialData: UserData = {
    moods: [],
    goals: [],
    assessmentResult: null,
    personalizedContent: null,
    achievements: initialAchievements,
    interactions: [],
    dailyPlan: null,
    dailyPlanTimestamp: null,
};


function getRandomAvatar() {
    const animal = animalAvatars[Math.floor(Math.random() * animalAvatars.length)];
    return `https://source.unsplash.com/100x100/?${animal}`;
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State for user data, synced with Firestore
  const [userData, setUserData] = useState<UserData>(initialData);
  
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const currentUser: User = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || (firebaseUser.isAnonymous ? "Guest" : "User"),
            email: firebaseUser.email,
            avatar: firebaseUser.photoURL || getRandomAvatar(),
            isAnonymous: firebaseUser.isAnonymous
        };
        setUser(currentUser);

        // Firestore real-time listener
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
             if (docSnap.exists()) {
                const data = docSnap.data() as UserData;
                // Check if the plan is older than 24 hours
                if (data.dailyPlanTimestamp) {
                    const planDate = new Date(data.dailyPlanTimestamp);
                    const now = new Date();
                    const diffHours = (now.getTime() - planDate.getTime()) / (1000 * 60 * 60);
                    if (diffHours > 24) {
                        data.dailyPlan = null;
                        data.dailyPlanTimestamp = null;
                        // No need to write back to DB here, will be overwritten on next plan generation
                    }
                }
                setUserData(data);
            } else {
                // If the user document doesn't exist (e.g., new user), create it.
                setDoc(userDocRef, initialData);
                setUserData(initialData);
            }
             setLoading(false);
        });

        return () => unsubscribeFirestore(); // Cleanup listener on unmount or user change
      } else {
        setUser(null);
        setUserData(initialData); // Reset data on logout
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);
  
  // Generic function to update a part of the user's data in Firestore
  const updateUserData = useCallback((data: Partial<UserData>) => {
    if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        // Use setDoc with merge: true to update or create fields without overwriting the whole doc
        setDoc(userDocRef, data, { merge: true });
    }
  }, [user]);

  const setGoals = (goals: Goal[]) => updateUserData({ goals });
  const setMoods = (moods: Mood[]) => {
      const today = new Date().toISOString().split('T')[0];
      const otherMoods = userData.moods.filter(m => m.date !== today);
      updateUserData({ moods: [...otherMoods, ...moods] });
  };

  const setAssessmentResult = (assessmentResult: MentalHealthAssessmentOutput | null) => updateUserData({ assessmentResult });
  const setPersonalizedContent = (personalizedContent: PersonalizedContentOutput | null) => updateUserData({ personalizedContent });

  const setDailyPlan = (dailyPlan: DailyPlannerOutput | null) => {
    if (dailyPlan) {
        updateUserData({ dailyPlan, dailyPlanTimestamp: new Date().toISOString() });
    } else {
        updateUserData({ dailyPlan: null, dailyPlanTimestamp: null });
    }
  };

  const addAchievement = useCallback((key: AchievementKey) => {
    if (user?.isAnonymous) return;
    
    const achievement = userData.achievements.find(a => a.id === key);
    if (achievement && !achievement.unlocked) {
        setUnlockedAchievement({ ...achievement, unlocked: true });
        const updatedAchievements = userData.achievements.map(a => 
            a.id === key ? { ...a, unlocked: true } : a
        );
        updateUserData({ achievements: updatedAchievements });
    }
  }, [user, userData.achievements, updateUserData]);

  const addInteraction = useCallback((interaction: Interaction) => {
    if (user?.isAnonymous) return;
    const updatedInteractions = [interaction, ...userData.interactions];
    updateUserData({ interactions: updatedInteractions });
  }, [user, userData.interactions, updateUserData]);


  const signup = async (name: string, email: string, password: string): Promise<FirebaseUser> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const avatarUrl = getRandomAvatar();
    await updateProfile(userCredential.user, {
      displayName: name,
      photoURL: avatarUrl,
    });
    
    // The onAuthStateChanged listener will handle setting up the new user doc in Firestore
    return userCredential.user;
  };

  const login = async (email: string, password: string): Promise<FirebaseUser> => {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
  };

  const loginWithGoogle = async (): Promise<FirebaseUser> => {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      return userCredential.user;
  }
  
  const loginAnonymously = async(): Promise<FirebaseUser> => {
      const userCredential = await signInAnonymously(auth);
      return userCredential.user;
  }

  const logout = async () => {
    await signOut(auth);
    // User state will be cleared by the onAuthStateChanged listener
  };

  const clearUnlockedAchievement = () => {
    setUnlockedAchievement(null);
  };


  const value: AppContextType = useMemo(() => ({
    user,
    loading,
    goals: userData.goals,
    moods: userData.moods,
    assessmentResult: userData.assessmentResult,
    personalizedContent: userData.personalizedContent,
    achievements: userData.achievements,
    interactions: userData.interactions,
    dailyPlan: userData.dailyPlan || null,
    setGoals,
    setMoods: (newMoods) => {
        const today = new Date().toISOString().split('T')[0];
        const oldMoods = userData.moods.filter(m => m.date !== today);
        updateUserData({ moods: [...oldMoods, ...newMoods] });
    },
    setAssessmentResult,
    setPersonalizedContent,
    setDailyPlan,
    signup,
    login,
    loginWithGoogle,
    loginAnonymously,
    logout,
    addAchievement,
    addInteraction,
    unlockedAchievement,
    clearUnlockedAchievement,
  }), [user, loading, userData, addAchievement, addInteraction, unlockedAchievement, updateUserData]);

  return (
    <AppContext.Provider value={value}>
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
