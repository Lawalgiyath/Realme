"use client";

import React, { useState } from 'react';
import {
  HeartPulse,
  LayoutDashboard,
  Library,
  Sparkles,
  FileText,
  Target,
  PanelLeft,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  User,
  BookHeart,
  Bot,
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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useApp } from '@/context/app-context';
import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import Journal from './journal';
import AiCoach from './ai-coach';


const SidebarNav = ({ activeTab, navigateTo, isCollapsed, toggleCollapse }: { activeTab: string, navigateTo: (tab: string) => void, isCollapsed: boolean, toggleCollapse: () => void, className?: string }) => (
  <nav className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
    <div className={cn("flex items-center gap-2 p-4 border-b border-sidebar-border", isCollapsed && "justify-center")}>
      <div className="p-1.5 rounded-lg bg-sidebar-primary">
        <HeartPulse className="h-6 w-6 text-sidebar-primary-foreground" />
      </div>
      <h1 className={cn("text-xl font-semibold font-headline transition-opacity duration-300", isCollapsed && "opacity-0 w-0")}>Realme</h1>
    </div>
    <TooltipProvider delayDuration={0}>
    <div className="flex-1 p-2 space-y-1">
        <SidebarNavItem icon={LayoutDashboard} label="Dashboard" tab="dashboard" activeTab={activeTab} navigateTo={navigateTo} isCollapsed={isCollapsed} />
        <SidebarNavItem icon={Bot} label="Daily Planner" tab="coach" activeTab={activeTab} navigateTo={navigateTo} isCollapsed={isCollapsed} />
        <SidebarNavItem icon={FileText} label="Assessment" tab="assessment" activeTab={activeTab} navigateTo={navigateTo} isCollapsed={isCollapsed} />
        <SidebarNavItem icon={BookHeart} label="Journal" tab="journal" activeTab={activeTab} navigateTo={navigateTo} isCollapsed={isCollapsed} />
        <SidebarNavItem icon={Target} label="Goals & Content" tab="goals" activeTab={activeTab} navigateTo={navigateTo} isCollapsed={isCollapsed} />
        <SidebarNavItem icon={Library} label="Resources" tab="resources" activeTab={activeTab} navigateTo={navigateTo} isCollapsed={isCollapsed} />
    </div>
    </TooltipProvider>
    <div className="p-2 mt-auto border-t border-sidebar-border">
        <Card className={cn("bg-sidebar-accent border-none shadow-inner transition-all", isCollapsed && "p-2 bg-transparent shadow-none")}>
          <CardHeader className={cn("p-4", isCollapsed && "hidden")}>
            <CardTitle className="text-base flex items-center gap-2 text-sidebar-accent-foreground">
              <Sparkles className="text-sidebar-primary" />
              Personalized Insights
            </CardTitle>
            <CardDescription className="text-xs text-sidebar-accent-foreground/80">
              Complete your assessment to unlock personalized content and
              support from Aya.
            </CardDescription>
          </CardHeader>
          <CardContent className={cn("p-4 pt-0", isCollapsed && "hidden")}>
            <Button size="sm" className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" onClick={() => navigateTo('assessment')}>
              Start Assessment
            </Button>
          </CardContent>
        </Card>
        <div className="mt-2">
            <Button variant="ghost" className="w-full justify-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={toggleCollapse}>
                {isCollapsed ? <ChevronsRight /> : <ChevronsLeft />}
                <span className="sr-only">{isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}</span>
            </Button>
        </div>
    </div>
  </nav>
);

const SidebarNavItem = ({ icon: Icon, label, tab, activeTab, navigateTo, isCollapsed }: { icon: React.ElementType, label: string, tab: string, activeTab: string, navigateTo: (tab: string) => void, isCollapsed: boolean }) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <Button
              variant={activeTab === tab ? 'secondary' : 'ghost'}
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", 
                isCollapsed && "justify-center",
                activeTab === tab && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              onClick={() => navigateTo(tab)}
            >
              <Icon className="h-5 w-5" />
              <span className={cn("ml-2 transition-opacity", isCollapsed && "opacity-0 w-0")}>{label}</span>
            </Button>
        </TooltipTrigger>
        {isCollapsed && (
            <TooltipContent side="right" className="bg-popover text-popover-foreground">
                <p>{label}</p>
            </TooltipContent>
        )}
    </Tooltip>
);


export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logout } = useApp();
  const router = useRouter();

  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false); // Close mobile sidebar on navigation
  };
  
  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(prevState => !prevState);
  };

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className={cn("hidden md:block flex-shrink-0 border-r border-sidebar-border transition-all duration-300", isSidebarCollapsed ? 'w-20' : 'w-64')}>
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
                <SheetContent side="left" className="p-0 w-72 border-r-0">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <SidebarNav activeTab={activeTab} navigateTo={navigateTo} isCollapsed={false} toggleCollapse={() => {}} />
                </SheetContent>
            </Sheet>
            <h1 className="text-lg font-semibold md:text-xl font-headline">
              Welcome back, {user?.name.split(' ')[0]}!
            </h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                        <AvatarImage
                            src={user?.avatar}
                            alt={user?.name}
                            data-ai-hint="animal avatar"
                        />
                        <AvatarFallback>{user?.name?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                     <TabsTrigger value="coach">
                      <Bot className="mr-2 h-4 w-4" />
                      Daily Planner
                    </TabsTrigger>
                    <TabsTrigger value="assessment">
                    <FileText className="mr-2 h-4 w-4" />
                    Assessment
                    </TabsTrigger>
                    <TabsTrigger value="journal">
                      <BookHeart className="mr-2 h-4 w-4" />
                      Journal
                    </TabsTrigger>
                    <TabsTrigger value="goals">
                    <Target className="mr-2 h-4 w-4" />
                    Goals & Content
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
                  <WellnessGoals />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="coach">
              <AiCoach />
            </TabsContent>
            <TabsContent value="assessment">
              <Assessment />
            </TabsContent>
            <TabsContent value="journal">
              <Journal />
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
