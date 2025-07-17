"use client";

import { useState } from 'react';
import { GlassWater, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { reframeWorry } from '@/ai/flows/worry-jar-flow';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export default function WorryJar() {
  const [worry, setWorry] = useState('');
  const [reframedThought, setReframedThought] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmitWorry = async () => {
    if (worry.trim().length < 10) {
      toast({
        variant: 'destructive',
        title: 'Please share a bit more.',
        description: 'Your worry should be at least 10 characters long.',
      });
      return;
    }

    setLoading(true);
    setReframedThought('');
    try {
      const result = await reframeWorry({ worry });
      setReframedThought(result.reframedThought);
    } catch (error) {
      console.error('Failed to get reframed thought:', error);
      toast({
        variant: 'destructive',
        title: 'Oh no! Something went wrong.',
        description: 'Could not get a response from the AI. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10 border-2 border-primary/20">
                <GlassWater className="h-8 w-8 text-primary" />
            </div>
            <div>
                <CardTitle>The Worry Jar</CardTitle>
                <CardDescription>
                Write down what's on your mind. Let it go and receive a calmer thought.
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Textarea
            placeholder="For example: I'm worried about my upcoming presentation..."
            value={worry}
            onChange={(e) => setWorry(e.target.value)}
            rows={4}
            disabled={loading}
            className="text-base"
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSubmitWorry} disabled={loading || !worry.trim()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Place in Jar
              </>
            )}
          </Button>
        </div>

        {reframedThought && (
            <Alert className="bg-secondary border-secondary-foreground/20 animate-in fade-in-50">
              <Sparkles className="h-4 w-4 text-primary" />
              <AlertTitle className="font-headline">A Calmer Thought</AlertTitle>
              <AlertDescription className="mt-2 text-lg text-foreground">
                <p>{reframedThought}</p>
              </AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );
}
