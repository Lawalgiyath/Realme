'use client';
import { useApp } from '@/context/app-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, LogOut, Mail, Phone, User as UserIcon } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useApp();
  const router = useRouter();

  if (!user) {
    // This should be handled by the layout, but as a fallback:
    router.replace('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <div className="min-h-screen bg-secondary/30 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                    <Avatar className="h-24 w-24 border-4 border-primary/20">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-3xl">
                        {user.name[0].toUpperCase()}
                    </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                    <CardTitle className="text-3xl">{user.name}</CardTitle>
                    <CardDescription>
                        Your personal profile and account settings.
                    </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="mt-6">
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                            Account Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoItem icon={UserIcon} label="Full Name" value={user.name} />
                            <InfoItem icon={Mail} label="Email Address" value={user.email} />
                            <InfoItem icon={Phone} label="Phone Number" value={user.phone} />
                        </div>
                        
                        <h3 className="text-lg font-semibold text-foreground border-b pb-2 pt-6">
                            Account Actions
                        </h3>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button variant="outline">Change Password</Button>
                            <Button variant="destructive" onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Log Out
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
      </div>
    </div>
  );
}


function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
    return (
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
                <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-medium text-foreground">{value}</p>
            </div>
        </div>
    )
}
