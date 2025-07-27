
"use client";

import type { PersonalizedContentOutput } from '@/ai/flows/personalized-content';
import type { MentalHealthAssessmentOutput } from '@/ai/flows/mental-health-assessment';
import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, type User as FirebaseUser, GoogleAuthProvider, signInWithPopup, signInAnonymously } from 'firebase/auth';
import { doc, setDoc, onSnapshot, getDoc, collection, addDoc, serverTimestamp, getDocs, query, where, limit } from 'firebase/firestore';
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

export interface Organization {
  id: string;
  name: string;
  sector: string;
  leaderUid: string;
  createdAt: any;
}

export interface User {
  uid: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  isAnonymous: boolean;
  isLeader: boolean;
  organizationId?: string;
  organizationName?: string;
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
    name?: string;
    email?: string;
    avatar?: string;
    isLeader?: boolean;
    organizationId?: string;
    organizationName?: string;
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
  organization: Organization | null;
  signup: (name: string, email: string, password: string, isLeader?: boolean, organizationCode?: string, organizationName?: string, sector?: string) => Promise<FirebaseUser>;
  login: (email: string, password: string, isLeader?: boolean) => Promise<FirebaseUser>;
  loginWithGoogle: () => Promise<void>;
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
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [userData, setUserData] = useState<UserData>(initialData);
  
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
             if (docSnap.exists()) {
                const data = docSnap.data() as UserData;
                
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
                    name: firebaseUser.displayName || (firebaseUser.isAnonymous ? "Guest" : data.name || "User"),
                    email: firebaseUser.email,
                    avatar: firebaseUser.photoURL || data.avatar,
                    isAnonymous: firebaseUser.isAnonymous,
                    isLeader: data.isLeader || false,
                    organizationId: data.organizationId,
                    organizationName: data.organizationName,
                };
                setUser(currentUser);

                if (currentUser.isLeader && currentUser.organizationId) {
                   const orgDocRef = doc(db, 'organizations', currentUser.organizationId);
                   onSnapshot(orgDocRef, (orgSnap) => {
                       if (orgSnap.exists()) {
                           setOrganization({ id: orgSnap.id, ...orgSnap.data() } as Organization);
                       }
                   });
                } else {
                    setOrganization(null);
                }
            }
             setLoading(false);
        }, (error) => {
            console.error("Firestore snapshot error:", error);
            setLoading(false);
        });

        return () => unsubscribeFirestore();
      } else {
        setUser(null);
        setOrganization(null);
        setUserData(initialData);
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
            personalizedContent: null
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


  const signup = async (name: string, email: string, password: string, isLeader = false, organizationCode?: string, organizationName?: string, sector?: string): Promise<FirebaseUser> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user: firebaseUser } = userCredential;

    await updateProfile(firebaseUser, { displayName: name });
    const avatarUrl = getRandomAvatar();
    await updateProfile(firebaseUser, { photoURL: avatarUrl });
    
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDataToSet: UserData = {
        ...initialData,
        name: name,
        email: email,
        avatar: avatarUrl,
        isLeader,
    };

    if (isLeader && organizationName && sector) {
        const orgsRef = collection(db, 'organizations');
        const newOrgRef = await addDoc(orgsRef, {
            name: organizationName,
            sector,
            leaderUid: firebaseUser.uid,
            createdAt: serverTimestamp(),
        });
        userDataToSet.organizationId = newOrgRef.id;
        userDataToSet.organizationName = organizationName;
        await setDoc(doc(db, 'users', firebaseUser.uid), { organizationId: newOrgRef.id }, { merge: true });
    } else if (organizationCode) {
        const orgQuery = query(collection(db, 'organizations'), where('__name__', '==', organizationCode), limit(1));
        const orgSnapshot = await getDocs(orgQuery);
        if (orgSnapshot.empty) {
            await firebaseUser.delete();
            throw new Error('ORGANIZATION_CODE_INVALID');
        }
        const orgDoc = orgSnapshot.docs[0];
        userDataToSet.organizationId = orgDoc.id;
        userDataToSet.organizationName = orgDoc.data().name;
    }

    await setDoc(userDocRef, userDataToSet);
    return firebaseUser;
  };

  const login = async (email: string, password: string, isLeader = false): Promise<FirebaseUser> => {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      let userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
          // User exists in Auth but not Firestore. Create their document.
          console.log(`User document not found for ${userCredential.user.uid}, creating one...`);
          const userDataToSet: UserData = {
              ...initialData,
              name: userCredential.user.displayName,
              email: userCredential.user.email,
              avatar: userCredential.user.photoURL,
              isLeader: false, // Default to false, leader check happens next
          };
          await setDoc(userDocRef, userDataToSet);
          userDoc = await getDoc(userDocRef); // Re-fetch the document
      }

      const userData = userDoc.data();
      if (isLeader && !userData?.isLeader) {
          await signOut(auth);
          throw new Error("NOT_A_LEADER");
      }

      return userCredential.user;
  };

  const loginWithGoogle = async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const userDocRef = doc(db, 'users', result.user.uid);
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) {
      await setDoc(userDocRef, {
        ...initialData,
        name: result.user.displayName,
        email: result.user.email,
        avatar: result.user.photoURL,
        isLeader: false,
      });
    }
  };
  
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
    organization,
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
  }), [user, organization, loading, userData, addAchievement, addInteraction, unlockedAchievement, updateUserData]);

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


    