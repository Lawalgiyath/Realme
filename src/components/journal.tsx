"use client";

import { useState, useEffect, useRef } from 'react';
import { BookHeart, Loader2, Sparkles, Wand2, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { analyzeJournalEntry } from '@/ai/flows/journal-analysis-flow';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { reframeWorry } from '@/ai/flows/worry-jar-flow';

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
  const [reframedThought, setReframedThought] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [placeholder, setPlaceholder] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    setPlaceholder(prompts[Math.floor(Math.random() * prompts.length)]);
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setEntry(transcript);
      };
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        toast({
            variant: 'destructive',
            title: 'Voice Error',
            description: `An error occurred with voice recognition: ${event.error}`,
        });
        setIsListening(false);
      };
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [toast]);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
        toast({
            variant: 'destructive',
            title: 'Not Supported',
            description: 'Your browser does not support voice recognition.',
        });
        return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsListening(!isListening);
  };

  const handleAnalyzeEntry = async () => {
    if (entry.trim().length > 10 && entry.trim().length < 100) {
        handleWorrySubmit();
        return;
    }
      
    if (entry.trim().length < 100) {
      toast({
        variant: 'destructive',
        title: 'Please write a bit more.',
        description: 'For a full analysis, your journal entry should be at least 100 characters long. For shorter thoughts, we provide a quick reflection.',
      });
      return;
    }

    setLoading(true);
    setAnalysis(null);
    setReframedThought('');

    try {
      const result = await analyzeJournalEntry({ journalEntry: entry });
      setAnalysis(result);
    } catch (error) {
      console.error('Failed to analyze journal entry:', error);
      toast({
        variant: 'destructive',
        title: 'Oh no! Something went wrong.',
        description: 'Could not get a response from Aya. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWorrySubmit = async () => {
    setLoading(true);
    setAnalysis(null);
    setReframedThought('');
    try {
      const result = await reframeWorry({ worry: entry });
      setReframedThought(result.reframedThought);
    } catch (error) {
       console.error('Failed to get reframed thought:', error);
      toast({
        variant: 'destructive',
        title: 'Oh no! Something went wrong.',
        description: 'Could not get a response from Aya. Please try again.',
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
                <CardTitle>Journal with Aya</CardTitle>
                <CardDescription>
                Write a short worry or a long reflection. Get a supportive perspective from your guide, Aya.
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
            <div className="relative">
                <Textarea
                    placeholder={placeholder}
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    rows={10}
                    disabled={loading}
                    className="text-base"
                />
                <Button
                    type="button"
                    size="icon"
                    variant={isListening ? 'destructive' : 'ghost'}
                    className="absolute bottom-2 right-2"
                    onClick={handleMicClick}
                >
                    {isListening ? <MicOff /> : <Mic />}
                </Button>
            </div>
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
                Analyze My Thoughts
              </>
            )}
          </Button>
        </div>

        {reframedThought && (
            <Alert className="bg-secondary border-secondary-foreground/20 animate-in fade-in-50">
              <Sparkles className="h-4 w-4 text-primary" />
              <AlertTitle className="font-headline">A Calmer Thought from Aya</AlertTitle>
              <AlertDescription className="mt-2 text-lg text-foreground">
                <p>{reframedThought}</p>
              </AlertDescription>
            </Alert>
        )}

        {analysis && (
            <Alert className="bg-secondary border-secondary-foreground/20 animate-in fade-in-50">
              <Sparkles className="h-4 w-4 text-primary" />
              <AlertTitle className="font-headline">Aya's Thoughts</AlertTitle>
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
