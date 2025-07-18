
'use server';
/**
 * @fileOverview Provides AI-powered analysis for a user's journal entry.
 *
 * - analyzeJournalEntry - A function that takes a journal entry and returns a summary and a reflective thought.
 * - JournalAnalysisInput - The input type for the analyzeJournalEntry function.
 * - JournalAnalysisOutput - The return type for the analyzeJournalEntry function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const JournalAnalysisInputSchema = z.object({
  journalEntry: z
    .string()
    .describe('The text content of the user\'s journal entry.'),
});
export type JournalAnalysisInput = z.infer<typeof JournalAnalysisInputSchema>;

const JournalAnalysisOutputSchema = z.object({
  summary: z.string().describe("A brief, empathetic summary of the key themes and emotions in the user's journal entry."),
  reflection: z.string().describe('A single, gentle, and constructive question or thought to prompt deeper reflection. It should be supportive and non-judgmental.'),
});
export type JournalAnalysisOutput = z.infer<typeof JournalAnalysisOutputSchema>;

export async function analyzeJournalEntry(
  input: JournalAnalysisInput
): Promise<JournalAnalysisOutput> {
  return journalAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'journalAnalysisPrompt',
  input: {schema: JournalAnalysisInputSchema},
  output: {schema: JournalAnalysisOutputSchema},
  prompt: `You are an empathetic and insightful AI mental wellness companion. A user has shared a journal entry with you. Your task is to analyze it and provide a supportive response.

Do not give medical advice. Your tone should be warm, understanding, and encouraging.

1.  **Summarize:** Read the entry and briefly summarize the main feelings and topics the user is discussing. Acknowledge their feelings.
2.  **Reflect:** Offer one single, gentle, and open-ended question or a reflective thought that encourages the user to explore their feelings or situation from a new perspective. Avoid giving direct advice.

User's Journal Entry:
"{{{journalEntry}}}"

Provide your analysis in the specified output format.`,
});

const journalAnalysisFlow = ai.defineFlow(
  {
    name: 'journalAnalysisFlow',
    inputSchema: JournalAnalysisInputSchema,
    outputSchema: JournalAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
