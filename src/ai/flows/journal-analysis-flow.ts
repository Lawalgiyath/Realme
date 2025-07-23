
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
    .describe("The text content of the user's current journal entry."),
  previousInteractions: z.array(z.object({
      entry: z.string(),
      response: z.string(),
  })).optional().describe("A list of the user's previous journal entries and the AI's responses."),
  userGoals: z.array(z.string()).optional().describe("A list of the user's current wellness goals."),
  currentMood: z.string().optional().describe("The user's most recently logged mood."),
});
export type JournalAnalysisInput = z.infer<typeof JournalAnalysisInputSchema>;

const JournalAnalysisOutputSchema = z.object({
  summary: z.string().describe("A brief, empathetic summary of the key themes and emotions in the user's current journal entry."),
  reflection: z.string().describe('A single, gentle, and constructive question or thought to prompt deeper reflection. It should be supportive and non-judgmental.'),
  patternInsight: z.string().optional().describe("An observation about a recurring pattern or theme noticed from previous interactions. Only include this if a clear and helpful pattern is evident."),
  goalConnection: z.string().optional().describe("A comment that gently connects the journal entry to one of the user's stated goals. Only include if there is a direct and relevant connection."),
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
  prompt: `You are Aya, an empathetic and insightful AI mental wellness companion with the skills of a therapeutic advisor. Your role is to provide a supportive, reflective, and context-aware response to a user's journal entry. You must be gentle, non-judgmental, and avoid giving direct medical advice.

**CONTEXT:**
- **User's Current Mood:** {{#if currentMood}}"{{{currentMood}}}"{{else}}Not specified.{{/if}}
- **User's Stated Goals:** {{#if userGoals}}{{#each userGoals}}- {{{this}}}\n{{/each}}{{else}}No goals specified.{{/if}}
- **Previous Interactions (most recent first):**
  {{#if previousInteractions}}
    {{#each previousInteractions}}
    - User Entry: "{{this.entry}}"
    - Your Response: "{{this.response}}"
    ---
    {{/each}}
  {{else}}
    This is the user's first interaction.
  {{/if}}

**YOUR TASK:**
Analyze the user's **current journal entry** below in light of the context provided.

**User's Current Journal Entry:**
"{{{journalEntry}}}"

**Based on your analysis, provide the following in the specified output format:**

1.  **Summary:** Briefly and empathetically summarize the main feelings and topics in the user's **current** entry. Acknowledge their feelings directly.
2.  **Reflection:** Offer one single, gentle, and open-ended question or a reflective thought that encourages the user to explore their feelings or situation from a new perspective. Avoid giving direct advice.
3.  **Pattern Insight (Optional):** If you notice a clear, significant, and helpful pattern or recurring theme when comparing the current entry to past interactions, mention it gently. For example: "I've noticed that you often mention feeling overwhelmed on Sundays. Is there something about the weekend ending that feels particularly heavy?" If no clear pattern emerges, leave this field empty.
4.  **Goal Connection (Optional):** If the current entry directly relates to one of the user's stated goals, create a gentle connection. For example: "This experience seems to tie into your goal of 'setting healthy boundaries.' It sounds like that was a really challenging situation to navigate." If there's no direct connection, leave this field empty.
`,
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
