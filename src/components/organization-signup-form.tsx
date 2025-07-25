
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { FirebaseError } from "firebase/app"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useApp } from "@/context/app-context"
import { Briefcase, Loader2 } from "lucide-react"
import { collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Your name must be at least 2 characters.",
  }),
   organizationName: z.string().min(2, {
    message: "Organization name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
})

export default function OrganizationSignupForm() {
  const router = useRouter();
  const { signup } = useApp();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      organizationName: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
        const userCredential = await signup(values.name, values.email, values.password, true);
        
        const userDocRef = doc(db, 'users', userCredential.uid);

        // Create organization document
        const orgsRef = collection(db, 'organizations');
        const orgDoc = await addDoc(orgsRef, {
            name: values.organizationName,
            leaderUid: userCredential.uid,
            leaderName: values.name,
            createdAt: serverTimestamp()
        });

        // Add orgId to the leader's user document
        await setDoc(userDocRef, {
            organizationId: orgDoc.id,
        }, { merge: true });

        toast({
            title: "Organization Account Created!",
            description: "You have successfully signed up. Taking you to the dashboard...",
        });
        router.push("/organization/dashboard");

    } catch (error) {
        handleAuthError(error, "Signup Failed");
    } finally {
        setLoading(false);
    }
  }

  const handleAuthError = (error: any, title: string) => {
    console.error(title, error);
    let description = "An unexpected error occurred. Please try again.";
    if (error instanceof FirebaseError) {
        switch(error.code) {
            case 'auth/email-already-in-use':
                description = "This email address is already in use by another account.";
                break;
            case 'auth/invalid-email':
                description = "The email address is not valid.";
                break;
            case 'auth/weak-password':
                description = "The password is too weak. Please use a stronger password.";
                break;
            default:
                description = "Could not create your account. Please try again."
        }
    }
    toast({
        variant: "destructive",
        title: title,
        description,
    });
  }

  return (
    <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
             <div className="flex justify-center items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-primary">
                    <Briefcase className="h-6 w-6 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Realme for Organizations</h1>
            </div>
            <CardTitle>Create a Leader Account</CardTitle>
            <CardDescription>Register your organization to get wellness insights.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Your Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} disabled={loading} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="organizationName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Organization Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="St. Patrick's College" {...field} disabled={loading} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Work Email</FormLabel>
                            <FormControl>
                                <Input placeholder="name@example.com" {...field} disabled={loading} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} disabled={loading} />
                            </FormControl>
                             <FormDescription>
                                Must be at least 8 characters long.
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>
            </Form>
            <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/organization/login" className="underline text-primary">
                    Log in
                </Link>
            </div>
        </CardContent>
    </Card>
  )
}
