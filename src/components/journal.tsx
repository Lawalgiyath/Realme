
"use client";

import { useState, useEffect } from 'react';
import { BookHeart, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { analyzeJournalEntry } from '@/ai/flows/journal-analysis-flow';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const prompts = [
    "What's on your mind today?",
    "Describe a feeling you're currently experiencing.",
    "What is one thing you're grateful for right now?",
    "What's a small victory you can celebrate today?",
    "Write about a challenge you're facing and one small step you can take to address it.",
    "What does your ideal day look like? Describe it.",
];

export default function Journal() {
  const [entry, setEntry] = useState('');
  const [analysis, setAnalysis] = useState<{ summary: string; reflection: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [placeholder, setPlaceholder] = useState('');

  useEffect(() => {
    setPlaceholder(prompts[Math.floor(Math.random() * prompts.length)]);
  }, []);

  const handleAnalyzeEntry = async () => {
    if (entry.trim().length < 50) {
      toast({
        variant: 'destructive',
        title: 'Please write a bit more.',
        description: 'Your journal entry should be at least 50 characters long for a meaningful analysis.',
      });
      return;
    }

    setLoading(true);
    setAnalysis(null);
    try {
      const result = await analyzeJournalEntry({ journalEntry: entry });
      setAnalysis(result);
    } catch (error) {
      console.error('Failed to analyze journal entry:', error);
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
                <BookHeart className="h-8 w-8 text-primary" />
            </div>
            <div>
                <CardTitle>My AI Journal</CardTitle>
                <CardDescription>
                Reflect on your thoughts and feelings. Get a supportive perspective from your AI companion.
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Textarea
            placeholder={placeholder}
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            rows={10}
            disabled={loading}
            className="text-base"
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={handleAnalyzeEntry} disabled={loading || !entry.trim()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Analyze My Entry
              </>
            )}
          </Button>
        </div>

        {analysis && (
            <Alert className="bg-secondary border-secondary-foreground/20 animate-in fade-in-50">
              <Sparkles className="h-4 w-4 text-primary" />
              <AlertTitle className="font-headline">Your AI Companion's Thoughts</AlertTitle>
              <AlertDescription className="mt-4 space-y-4 text-foreground">
                <div>
                  <h3 className="font-semibold">Summary of your entry:</h3>
                  <p className="text-sm">{analysis.summary}</p>
                </div>
                <div>
                  <h3 className="font-semibold">A reflection to consider:</h3>
                   <p className="text-sm">{analysis.reflection}</p>
                </div>
              </AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );
}
