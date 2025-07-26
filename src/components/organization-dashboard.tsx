
"use client";

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  LogOut,
  User,
  PanelLeft,
  Copy,
  Users,
  BarChart,
  ClipboardList,
  Smile,
  Leaf,
  Star,
  AreaChart,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useApp } from '@/context/app-context';
import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { useToast } from '@/hooks/use-toast';
import { organizationInsights, OrganizationInsightsOutput } from '@/ai/flows/organization-insights-flow';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export default function OrganizationDashboard() {
  const { user, logout, loading: appLoading } = useApp();
  const router = useRouter();
  const { toast } = useToast();
  const [organization, setOrganization] = useState<{id: string, name: string} | null>(null);
  const [insights, setInsights] = useState<OrganizationInsightsOutput | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(true);

  useEffect(() => {
    if (appLoading) return; // Wait for the main app loading to finish

    if (!user) {
      router.replace('/organization/login');
      return;
    }
    if (!user.isLeader) {
      router.replace('/dashboard'); // It's a normal user, send them to their dashboard
      return;
    }

    const fetchOrgData = async () => {
        setLoadingInsights(true);
        if (!user.organizationId) {
            console.error("Leader is missing organizationId");
            toast({ variant: 'destructive', title: "Error", description: "Your account is not linked to an organization."});
            setLoadingInsights(false);
            return;
        }

        const orgDocRef = doc(db, "organizations", user.organizationId);
        const orgDocSnap = await getDoc(orgDocRef);
        
        if (!orgDocSnap.exists()) {
            console.error("Organization not found for leader:", user.uid);
            toast({ variant: 'destructive', title: "Error", description: "Could not find your organization." });
            setLoadingInsights(false);
            return;
        }

        const orgData = { id: orgDocSnap.id, ...orgDocSnap.data() } as {id: string, name: string};
        setOrganization(orgData);

        // Fetch user data for the org
        const usersQuery = query(collection(db, "users"), where("organizationId", "==", orgDocSnap.id));
        const usersSnapshot = await getDocs(usersQuery);
        const memberData = usersSnapshot.docs.map(doc => {
            const { name, email, ...rest } = doc.data(); // Strip PII
            return rest;
        });

        if (memberData.length === 0) {
             setInsights(null);
             setLoadingInsights(false);
             return;
        }

        try {
            const result = await organizationInsights({
                organizationId: orgData.id,
                memberData: JSON.stringify(memberData)
            });
            setInsights(result);
        } catch(e) {
            console.error(e);
            toast({
                variant: 'destructive',
                title: "AI Analysis Failed",
                description: "Could not generate organization insights.",
            })
        } finally {
            setLoadingInsights(false);
        }
    };

    fetchOrgData();
  }, [user, appLoading, router, toast]);

  const handleLogout = () => {
    logout();
    router.replace('/organization/login');
  };

  const copyOrgCode = () => {
    if (organization) {
        navigator.clipboard.writeText(organization.id);
        toast({
            title: "Copied to Clipboard",
            description: "You can now share the organization code with your members.",
        });
    }
  }

   if (appLoading || !user || !organization) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-secondary/30">
        <aside className="hidden md:block w-72 flex-shrink-0 border-r bg-background">
             <nav className="flex flex-col h-full">
                <div className="flex items-center gap-3 p-4 border-b h-16">
                    <div className="p-1.5 rounded-lg bg-primary">
                        <Briefcase className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h1 className="text-xl font-semibold font-headline">Org Dashboard</h1>
                </div>
                <div className="p-4">
                    <p className="text-sm font-semibold text-foreground">{organization?.name}</p>
                    <p className="text-xs text-muted-foreground">Welcome, {user?.name?.split(' ')[0]}</p>
                </div>
            </nav>
        </aside>

        <main className="flex-1">
            <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <PanelLeft />
                        <span className="sr-only">Toggle Sidebar</span>
                    </Button>
                    <h1 className="text-lg font-semibold md:text-xl font-headline">
                        Anonymous Wellness Overview
                    </h1>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10">
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
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>

            <div className="p-4 md:p-8 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Onboard Your Members</CardTitle>
                        <CardDescription>Share this code with your members so they can join your organization on signup.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <p className="text-2xl font-mono p-3 bg-secondary rounded-md text-primary font-bold tracking-widest">{organization?.id}</p>
                        <Button onClick={copyOrgCode}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Code
                        </Button>
                    </CardContent>
                </Card>

                {loadingInsights ? (
                    <div className="flex justify-center items-center py-16 text-center">
                        <div>
                            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                            <p className="mt-4 text-muted-foreground">Aya is analyzing your organization's wellness data...</p>
                        </div>
                    </div>
                ) : insights ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <InfoCard title="Overall Sentiment" icon={Smile} content={insights.overallSentiment} />
                            <InfoCard title="Positive Highlights" icon={Star} content={insights.positiveHighlights} />
                            <InfoCard title="Trending Goals" icon={Leaf} content={insights.goalTrends} />
                        </div>
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <InfoCard title="Common Themes" icon={ClipboardList} content={insights.commonThemes} className="lg:col-span-1"/>
                            <InfoCard title="Areas for Attention" icon={AreaChart} content={insights.areasForAttention} className="lg:col-span-1"/>
                        </div>
                    </div>
                ) : (
                    <Alert>
                        <Users className="h-4 w-4" />
                        <AlertTitle>Waiting for Members</AlertTitle>
                        <AlertDescription>
                            Your dashboard is ready. As soon as members join and interact with the app, anonymous insights will appear here.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
      </main>
    </div>
  );
}

function InfoCard({ title, content, icon: Icon, className }: { title: string, content?: string, icon: React.ElementType, className?: string }) {
    const contentItems = content?.split('\n').filter(item => item.trim().length > 0);

    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
                <Icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-sm text-foreground">
                    {!content ? (
                        <p className="text-muted-foreground">No data yet.</p>
                    ) : contentItems && contentItems.length > 1 && content.includes('- ') ? (
                        <ul className="space-y-1 mt-2">
                            {contentItems.map((item, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-primary mt-1">&bull;</span>
                                  <span>{item.replace(/^- /, '')}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground">{content}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
