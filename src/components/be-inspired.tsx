"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Sparkles, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const dailyQuote = {
    quote: "The best way to predict the future is to create it.",
    author: "Peter Drucker"
};

const successStories = [
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

export default function BeInspired() {
    
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
                    {successStories.map((story, index) => (
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
        </div>
    )
}
