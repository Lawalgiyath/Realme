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
  ChevronsLeft,
  ChevronsRight,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


const SidebarNav = ({ activeTab, navigateTo, isCollapsed, toggleCollapse }: { activeTab: string, navigateTo: (tab: string) => void, isCollapsed: boolean, toggleCollapse: () => void, className?: string }) => (
  <nav className="flex flex-col h-full">
    <div className={cn("flex items-center gap-2 p-4 border-b", isCollapsed && "justify-center")}>
      <div className="p-1.5 rounded-lg bg-primary">
        <HeartPulse className="h-6 w-6 text-primary-foreground" />
      </div>
      <h1 className={cn("text-xl font-semibold font-headline transition-opacity duration-300", isCollapsed && "opacity-0 w-0")}>Realme</h1>
    </div>
    <TooltipProvider delayDuration={0}>
    <div className="flex-1 p-2 space-y-1">
        <SidebarNavItem icon={LayoutDashboard} label="Dashboard" tab="dashboard" activeTab={activeTab} navigateTo={navigateTo} isCollapsed={isCollapsed} />
        <SidebarNavItem icon={FileText} label="Assessment" tab="assessment" activeTab={activeTab} navigateTo={navigateTo} isCollapsed={isCollapsed} />
        <SidebarNavItem icon={Target} label="Goals" tab="goals" activeTab={activeTab} navigateTo={navigateTo} isCollapsed={isCollapsed} />
        <SidebarNavItem icon={GlassWater} label="Worry Jar" tab="worry-jar" activeTab={activeTab} navigateTo={navigateTo} isCollapsed={isCollapsed} />
        <SidebarNavItem icon={Library} label="Resources" tab="resources" activeTab={activeTab} navigateTo={navigateTo} isCollapsed={isCollapsed} />
    </div>
    </TooltipProvider>
    <div className="p-2 mt-auto border-t">
        <Card className={cn("bg-accent border-none shadow-inner transition-all", isCollapsed && "p-2 bg-transparent")}>
          <CardHeader className={cn("p-4", isCollapsed && "hidden")}>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="text-primary" />
              AI-Powered Insights
            </CardTitle>
            <CardDescription className="text-xs">
              Complete your assessment to unlock personalized content and
              support.
            </CardDescription>
          </CardHeader>
          <CardContent className={cn("p-4 pt-0", isCollapsed && "hidden")}>
            <Button size="sm" className="w-full" onClick={() => navigateTo('assessment')}>
              Start Assessment
            </Button>
          </CardContent>
        </Card>
        <Button variant="ghost" className="w-full justify-center mt-2" onClick={toggleCollapse}>
            {isCollapsed ? <ChevronsRight /> : <ChevronsLeft />}
            <span className="sr-only">{isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}</span>
        </Button>
    </div>
  </nav>
);

const SidebarNavItem = ({ icon: Icon, label, tab, activeTab, navigateTo, isCollapsed }: { icon: React.ElementType, label: string, tab: string, activeTab: string, navigateTo: (tab: string) => void, isCollapsed: boolean }) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <Button
              variant={activeTab === tab ? 'secondary' : 'ghost'}
              className={cn("w-full justify-start", isCollapsed && "justify-center")}
              onClick={() => navigateTo(tab)}
            >
              <Icon className="h-5 w-5" />
              <span className={cn("ml-2 transition-opacity", isCollapsed && "opacity-0 w-0")}>{label}</span>
            </Button>
        </TooltipTrigger>
        {isCollapsed && (
            <TooltipContent side="right">
                <p>{label}</p>
            </TooltipContent>
        )}
    </Tooltip>
);


export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false); // Close mobile sidebar on navigation
  };
  
  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(prevState => !prevState);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className={cn("hidden md:block flex-shrink-0 border-r transition-all duration-300", isSidebarCollapsed ? 'md:w-20' : 'md:w-64')}>
          <SidebarNav activeTab={activeTab} navigateTo={navigateTo} isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebarCollapse} />
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
                  <SidebarNav activeTab={activeTab} navigateTo={navigateTo} isCollapsed={false} toggleCollapse={() => {}} />
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
            <div className="md:hidden mb-4">
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
              <div className="grid gap-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
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
                </div>
                <div>
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
