
"use client";

import type { PersonalizedContentOutput } from '@/ai/flows/personalized-content';
import type { MentalHealthAssessmentOutput } from '@/ai/flows/mental-health-assessment';
import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, type User as FirebaseUser, GoogleAuthProvider, signInWithPopup, signInAnonymously } from 'firebase/auth';
import { doc, setDoc, onSnapshot, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
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
  isLeader?: boolean;
  organizationId?: string;
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
    assessmentTimestamp: string | null;
    personalizedContent: PersonalizedContentOutput | null;
    achievements: Achievement[];
    interactions: Interaction[];
    dailyPlan?: DailyPlannerOutput | null;
    dailyPlanTimestamp?: string | null;
    organizationId?: string;
    isLeader?: boolean;
}


interface AppContextType {
  moods: Mood[];
  setMoods: (moods: Mood[]) => void;
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
  assessmentResult: MentalHealthAssessmentOutput | null;
  assessmentTimestamp: string | null;
  setAssessmentResult: (result: MentalHealthAssessmentOutput | null) => void;
  personalizedContent: PersonalizedContentOutput | null;
  setPersonalizedContent: (content: PersonalizedContentOutput | null) => void;
  user: User | null;
  signup: (name: string, email: string, password: string, isLeader?: boolean, organizationCode?: string, organizationName?: string) => Promise<FirebaseUser>;
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
    assessmentTimestamp: null,
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
                    }
                }
                setUserData(data);

                 const currentUser: User = {
                    uid: firebaseUser.uid,
                    name: firebaseUser.displayName || (firebaseUser.isAnonymous ? "Guest" : "User"),
                    email: firebaseUser.email,
                    avatar: firebaseUser.photoURL,
                    isAnonymous: firebaseUser.isAnonymous,
                    isLeader: data.isLeader,
                    organizationId: data.organizationId
                };
                setUser(currentUser);
            }
             setLoading(false);
        }, (error) => {
            console.error("Firestore snapshot error:", error);
            setLoading(false);
        });

        return () => unsubscribeFirestore();
      } else {
        setUser(null);
        setUserData(initialData); // Reset data on logout
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);
  
  const updateUserData = useCallback((data: Partial<UserData>) => {
    if (user && !user.isAnonymous) {
        const userDocRef = doc(db, 'users', user.uid);
        setDoc(userDocRef, data, { merge: true });
    }
  }, [user]);

  const setGoals = (goals: Goal[]) => updateUserData({ goals });
  const setMoods = (moods: Mood[]) => {
      const today = new Date().toISOString().split('T')[0];
      const otherMoods = userData.moods.filter(m => m.date !== today);
      updateUserData({ moods: [...otherMoods, ...moods] });
  };

  const setAssessmentResult = (assessmentResult: MentalHealthAssessmentOutput | null) => {
    if (assessmentResult) {
         updateUserData({ 
            assessmentResult, 
            assessmentTimestamp: new Date().toISOString(),
            personalizedContent: null // Reset content plan on new assessment
        });
    } else {
        updateUserData({ assessmentResult: null, assessmentTimestamp: null });
    }
  };

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


 const signup = async (name: string, email: string, password: string, isLeader = false, organizationCode?: string, organizationName?: string): Promise<FirebaseUser> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const avatarUrl = isLeader ? null : getRandomAvatar();
        await updateProfile(userCredential.user, {
            displayName: name,
            photoURL: avatarUrl,
        });

        const userDocRef = doc(db, 'users', userCredential.user.uid);
        const userDataToSet: Partial<UserData> & { isLeader: boolean } = {
            ...initialData,
            isLeader
        };

        if (isLeader && organizationName) {
            // Create organization document
            const orgsRef = collection(db, 'organizations');
            const orgDoc = await addDoc(orgsRef, {
                name: organizationName,
                leaderUid: userCredential.user.uid,
                leaderName: name,
                createdAt: serverTimestamp()
            });
            // Add orgId to the leader's user document
            userDataToSet.organizationId = orgDoc.id;
        } else if (!isLeader && organizationCode) {
            // Verify organization code for regular user
            const orgQuery = query(collection(db, 'organizations'), where('__name__', '==', organizationCode));
            const orgSnapshot = await getDocs(orgQuery);
            if (!orgSnapshot.empty) {
                userDataToSet.organizationId = organizationCode;
            } else {
                console.warn("Invalid organization code provided during signup.");
                // Optionally, you could throw an error here to notify the user on the client-side.
            }
        }
        
        // Create the user document in Firestore with all collected data
        await setDoc(userDocRef, userDataToSet);
        
        return userCredential.user;
    } catch(error) {
        console.error("Signup failed in context:", error);
        throw error; // re-throw the error to be caught by the form's handler
    }
  };

  const login = async (email: string, password: string): Promise<FirebaseUser> => {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
  };

  const loginWithGoogle = async (): Promise<FirebaseUser> => {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        // First time Google sign-in
        const avatarUrl = getRandomAvatar();
        await updateProfile(userCredential.user, { photoURL: avatarUrl });
        await setDoc(userDocRef, initialData);
      }
      return userCredential.user;
  }
  
  const loginAnonymously = async(): Promise<FirebaseUser> => {
      const userCredential = await signInAnonymously(auth);
       const userDocRef = doc(db, 'users', userCredential.user.uid);
       await setDoc(userDocRef, initialData);
      return userCredential.user;
  }

  const logout = async () => {
    await signOut(auth);
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
    assessmentTimestamp: userData.assessmentTimestamp,
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

    
    