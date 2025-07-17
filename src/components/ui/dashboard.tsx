"use client";

import React from 'react';
import {
  HeartPulse,
  LayoutDashboard,
  Library,
  Sparkles,
  FileText,
  Target,
  Smile,
  Meh,
  Frown,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/context/app-context';
import Assessment from './assessment';
import WellnessGoals from './wellness-goals';
import ResourceDirectory from './resource-directory';
import MoodTracker from './mood-tracker';
import ProgressChart from './progress-chart';
import PersonalizedContent from './personalized-content';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default function Dashboard() {
  const { assessmentResult } = useApp();

  return (
      <div className="flex min-h-screen bg-background">
          <main className="flex-1">
            <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
              <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold md:text-xl font-headline">
                  Welcome back!
                </h1>
              </div>
              <Avatar>
                <AvatarImage
                  src="https://placehold.co/100x100.png"
                  alt="User"
                  data-ai-hint="user avatar"
                />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </header>
            <div className="p-4 md:p-6">
              <Tabs defaultValue="dashboard" className="w-full">
                <ScrollArea className="w-full whitespace-nowrap">
                  <TabsList className="grid-cols-none inline-grid w-auto">
                    <TabsTrigger value="dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </TabsTrigger>
                    <TabsTrigger value="assessment">
                      <FileText className="mr-2 h-4 w-4" />
                      Assessment
                    </TabsTrigger>
                    <TabsTrigger value="goals">
                      <Target className="mr-2 h-4 w-4" />
                      Goals
                    </TabsTrigger>
                    <TabsTrigger value="resources">
                      <Library className="mr-2 h-4 w-4" />
                      Resources
                    </TabsTrigger>
                  </TabsList>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
                <TabsContent value="dashboard">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="md:col-span-2 lg:col-span-2">
                      <CardHeader>
                        <CardTitle>Mood & Progress</CardTitle>
                        <CardDescription>
                          Track your emotional well-being over time.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ProgressChart />
                      </CardContent>
                    </Card>
                    <MoodTracker />
                    <Card className="md:col-span-2 lg:col-span-3">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <Sparkles className="text-primary h-5 w-5" />{' '}
                          Personalized For You
                        </CardTitle>
                        <CardDescription>
                          AI-driven content suggestions based on your assessment
                          results and preferences.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <PersonalizedContent />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="assessment">
                  <Assessment />
                </TabsContent>
                <TabsContent value="goals">
                  <WellnessGoals />
                </TabsContent>
                <TabsContent value="resources">
                  <ResourceDirectory />
                </TabsContent>
              </Tabs>
            </div>
          </main>
      </div>
  );
}
