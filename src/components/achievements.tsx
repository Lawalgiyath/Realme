"use client";

import { useApp } from "@/context/app-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Trophy, Award, Star, BookUser } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "./ui/tooltip";

const achievementIcons = {
    firstGoal: Star,
    assessmentComplete: BookUser,
    firstJournal: Award,
    contentGenerated: Trophy,
}

export default function Achievements() {
    const { achievements } = useApp();
    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>Your Achievements</CardTitle>
                <CardDescription>
                    You've unlocked {unlockedCount} of {achievements.length} badges. Keep up the great work!
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
                <TooltipProvider>
                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                        {achievements.map((achievement) => {
                            const Icon = achievementIcons[achievement.id];
                            return (
                                <Tooltip key={achievement.id}>
                                    <TooltipTrigger asChild>
                                        <div className={cn(
                                            "flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all duration-300",
                                            achievement.unlocked ? "border-primary/50 bg-primary/10 text-primary" : "border-dashed border-muted-foreground/30 text-muted-foreground/50"
                                        )}>
                                            <Icon className="h-10 w-10" />
                                            <p className="text-sm font-semibold text-center">{achievement.name}</p>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{achievement.description}</p>
                                    </TooltipContent>
                                </Tooltip>
                            )
                        })}
                    </div>
                </TooltipProvider>
            </CardContent>
        </Card>
    )
}
