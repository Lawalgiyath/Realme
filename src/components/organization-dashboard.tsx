
"use client";

import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  LogOut,
  User,
  PanelLeft,
  Briefcase,
  ClipboardList,
  LineChart,
  Copy,
  Users
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
import { useApp } from '@/context/app-context';
import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from "firebase/firestore";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (appLoading) {
      return; // Wait for the app context to finish loading user data.
    }

    if (!user) {
      // If there's no user after loading, redirect to login.
      router.replace('/organization/login');
      return;
    }

    if (!user.isLeader) {
      // If the user is logged in but is not a leader, redirect them.
      router.replace('/dashboard');
      return;
    }

    // If we have a valid leader, proceed to fetch organization data.
    const fetchOrgData = async () => {
        setLoading(true);
        const q = query(collection(db, "organizations"), where("leaderUid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            console.error("Organization not found for leader:", user.uid);
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Could not find your organization.",
            });
            setLoading(false);
            return;
        }

        const orgDoc = querySnapshot.docs[0];
        const orgData = { id: orgDoc.id, name: orgDoc.data().name };
        setOrganization(orgData);

        // Fetch user data for the org
        const usersQuery = query(collection(db, "users"), where("organizationId", "==", orgDoc.id));
        const usersSnapshot = await getDocs(usersQuery);
        const memberData = usersSnapshot.docs.map(doc => doc.data());

        if (memberData.length === 0) {
             setInsights(null);
             setLoading(false);
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
            setLoading(false);
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

   if (appLoading || !user || !user.isLeader) {
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
                <div className="flex items-center gap-3 p-4 border-b">
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
                        <DropdownMenuItem disabled>
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

            <div className="p-4 md:p-8 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Onboard Your Members</CardTitle>
                        <CardDescription>Share this code with your members (e.g., students, employees) so they can link their account to your organization when they sign up.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <p className="text-2xl font-mono p-3 bg-secondary rounded-md">{organization?.id}</p>
                        <Button onClick={copyOrgCode}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Code
                        </Button>
                    </CardContent>
                </Card>

                {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="ml-4 text-muted-foreground">Aya is analyzing your organization's wellness data...</p>
                    </div>
                ) : insights ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <InfoCard title="Overall Sentiment" icon={LineChart} content={insights.overallSentiment} />
                        <InfoCard title="Common Themes in Worries" icon={ClipboardList} content={insights.commonThemes} />
                        <InfoCard title="Trending Goals" icon={ClipboardList} content={insights.goalTrends} />
                        <InfoCard title="Positive Highlights" icon={ClipboardList} content={insights.positiveHighlights} />
                        <InfoCard title="Areas for Attention" icon={ClipboardList} content={insights.areasForAttention} />
                    </div>
                ) : (
                    <Alert>
                        <Users className="h-4 w-4" />
                        <AlertTitle>Waiting for Members</AlertTitle>
                        <AlertDescription>
                            Your dashboard is ready. As soon as members join your organization using the code above and start interacting with the app, anonymous wellness insights will appear here.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
      </main>
    </div>
  );
}


function InfoCard({ title, content, icon: Icon }: { title: string, content?: string, icon: React.ElementType }) {
    // Split content by newlines and render as a list if it contains bullet points
    const contentItems = content?.split('\n').filter(item => item.trim().length > 0);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-base text-foreground">
                    {!content ? (
                        <span className="text-muted-foreground">No data yet.</span>
                    ) : contentItems && contentItems.length > 1 ? (
                        <ul className="list-disc pl-5 space-y-1">
                            {contentItems.map((item, index) => (
                                <li key={index} className="text-sm">{item.replace(/^- /, '')}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm">{content}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
