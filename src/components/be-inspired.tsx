
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Sparkles, Heart, Send, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useApp } from '@/context/app-context';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { useToast } from '@/hooks/use-toast';
import { vetStory } from '@/ai/flows/story-vetting-flow';

const dailyQuote = {
    quote: "The best way to predict the future is to create it.",
    author: "Peter Drucker"
};

const initialSuccessStories = [
    {
        name: "Tunde",
        story: "I used to feel overwhelmed every morning. Using the daily planner helped me break down my tasks and feel in control. It’s a small change, but it made a huge difference.",
        avatarHint: "man portrait happy"
    },
    {
        name: "Aisha",
        story: "The Worry Jar felt silly at first, but reframing my anxious thoughts has become a powerful habit. Seeing them written down makes them less scary.",
        avatarHint: "woman portrait smiling"
    },
    {
        name: "Chiamaka",
        story: "Tracking my mood seemed simple, but seeing the chart after two weeks showed me a real pattern. It helped me connect my sleep to my mood and make positive changes.",
        avatarHint: "female portrait content"
    }
];

const storySchema = z.object({
  story: z.string().min(50, "Please share a bit more of your story (at least 50 characters).").max(500, "Your story is a bit long, please keep it under 500 characters."),
});

type StoryFormValues = z.infer<typeof storySchema>;

export default function BeInspired() {
    const { user } = useApp();
    const { toast } = useToast();
    const [stories, setStories] = useState(initialSuccessStories);
    const [loading, setLoading] = useState(false);

    const form = useForm<StoryFormValues>({
        resolver: zodResolver(storySchema),
        defaultValues: {
            story: ""
        }
    });

    const onSubmit = async (data: StoryFormValues) => {
        setLoading(true);
        try {
            const result = await vetStory({ story: data.story });

            if (result.isApproved) {
                setStories(prev => [{
                    name: user?.name.split(' ')[0] || "Community Member",
                    story: data.story,
                    avatarHint: "person smiling"
                }, ...prev]);

                toast({
                    title: "Thank You for Sharing!",
                    description: "Your story has been added to the community wall.",
                });
                form.reset();
            } else {
                 toast({
                    variant: "destructive",
                    title: "Story Under Review",
                    description: result.reason || "Your story could not be approved at this time. Please review and try again.",
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Oh no! Something went wrong.',
                description: 'Could not submit your story. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    }
    
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-primary/10 border-2 border-primary/20">
                            <Sparkles className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Quote of the Day</CardTitle>
                            <CardDescription>A little inspiration to brighten your day.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <blockquote className="border-l-4 border-primary pl-6 italic text-lg">
                        "{dailyQuote.quote}"
                        <footer className="mt-2 text-sm text-muted-foreground not-italic">— {dailyQuote.author}</footer>
                    </blockquote>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-primary/10 border-2 border-primary/20">
                            <Heart className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Community Stories</CardTitle>
                            <CardDescription>Read about the progress and success of others in the Realme community.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {stories.map((story, index) => (
                        <div key={index} className="p-4 rounded-lg bg-secondary/50 flex items-start gap-4">
                             <Avatar>
                                <AvatarImage src={`https://placehold.co/100x100.png`} data-ai-hint={story.avatarHint} alt={story.name}/>
                                <AvatarFallback>{story.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-muted-foreground leading-relaxed">"{story.story}"</p>
                                <p className="font-semibold mt-2 text-sm text-right w-full">- {story.name}</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
            
            <Card>
                 <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-primary/10 border-2 border-primary/20">
                            <Send className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Share Your Journey</CardTitle>
                            <CardDescription>Inspire others by sharing your own success story. Your story will be reviewed by Aya before posting.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField 
                                control={form.control}
                                name="story"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="sr-only">Your Success Story</FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                placeholder="e.g., When I first started, I struggled with... but now I feel..."
                                                rows={5}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end">
                                <Button type="submit" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    {loading ? "Submitting..." : "Share My Story"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}

    