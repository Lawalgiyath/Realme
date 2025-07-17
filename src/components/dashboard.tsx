"use client";

import React, { useState } from 'react';
import {
  HeartPulse,
  LayoutDashboard,
  Library,
  Sparkles,
  FileText,
  Target,
  GlassWater,
  PanelLeft,
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
import Assessment from './assessment';
import WellnessGoals from './wellness-goals';
import ResourceDirectory from './resource-directory';
import MoodTracker from './mood-tracker';
import ProgressChart from './progress-chart';
import PersonalizedContent from './personalized-content';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import WorryJar from './worry-jar';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';


const SidebarNav = ({ activeTab, navigateTo, className }: { activeTab: string, navigateTo: (tab: string) => void, className?: string }) => (
  <nav className={cn("flex flex-col h-full", className)}>
    <div className="flex items-center gap-2 p-4 border-b">
      <div className="p-1.5 rounded-lg bg-primary">
        <HeartPulse className="h-6 w-6 text-primary-foreground" />
      </div>
      <h1 className="text-xl font-semibold font-headline">Realme</h1>
    </div>
    <div className="flex-1 p-2">
      <Button
        variant={activeTab === 'dashboard' ? 'secondary' : 'ghost'}
        className="w-full justify-start"
        onClick={() => navigateTo('dashboard')}
      >
        <LayoutDashboard className="mr-2" />
        Dashboard
      </Button>
      <Button
        variant={activeTab === 'assessment' ? 'secondary' : 'ghost'}
        className="w-full justify-start"
        onClick={() => navigateTo('assessment')}
      >
        <FileText className="mr-2" />
        Assessment
      </Button>
      <Button
        variant={activeTab === 'goals' ? 'secondary' : 'ghost'}
        className="w-full justify-start"
        onClick={() => navigateTo('goals')}
      >
        <Target className="mr-2" />
        Goals
      </Button>
      <Button
        variant={activeTab === 'worry-jar' ? 'secondary' : 'ghost'}
        className="w-full justify-start"
        onClick={() => navigateTo('worry-jar')}
      >
        <GlassWater className="mr-2" />
        Worry Jar
      </Button>
      <Button
        variant={activeTab === 'resources' ? 'secondary' : 'ghost'}
        className="w-full justify-start"
        onClick={() => navigateTo('resources')}
      >
        <Library className="mr-2" />
        Resources
      </Button>
    </div>
    <div className="p-2 mt-auto">
        <Card className="bg-accent border-none shadow-inner">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="text-primary" />
              AI-Powered Insights
            </CardTitle>
            <CardDescription className="text-xs">
              Complete your assessment to unlock personalized content and
              support.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="sm" className="w-full" onClick={() => navigateTo('assessment')}>
              Start Assessment
            </Button>
          </CardContent>
        </Card>
    </div>
  </nav>
);


export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false); // Close sidebar on navigation
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block md:w-64 flex-shrink-0 border-r">
          <SidebarNav activeTab={activeTab} navigateTo={navigateTo} />
      </aside>

      <main className="flex-1">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar Trigger */}
             <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <PanelLeft />
                        <span className="sr-only">Toggle Sidebar</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <SidebarNav activeTab={activeTab} navigateTo={navigateTo} />
                </SheetContent>
            </Sheet>
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="md:hidden">
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
                    <TabsTrigger value="worry-jar">
                    <GlassWater className="mr-2 h-4 w-4" />
                    Worry Jar
                    </TabsTrigger>
                    <TabsTrigger value="resources">
                    <Library className="mr-2 h-4 w-4" />
                    Resources
                    </TabsTrigger>
                </TabsList>
                <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
            
            <TabsContent value="dashboard">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="md:col-span-2 lg:col-span-2">
                    <Card>
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
                </div>
                <MoodTracker />
                <div className="md:col-span-2 lg:col-span-3">
                    <Card>
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
              </div>
            </TabsContent>
            <TabsContent value="assessment">
              <Assessment />
            </TabsContent>
            <TabsContent value="goals">
              <WellnessGoals />
            </TabsContent>
            <TabsContent value="worry-jar">
              <WorryJar />
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
