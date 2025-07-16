'use server';
/**
 * @fileOverview Provides personalized content suggestions based on user assessment and preferences.
 *
 * - personalizedContentSuggestions - A function that suggests articles, meditations, and exercises.
 * - PersonalizedContentInput - The input type for the personalizedContentSuggestions function.
 * - PersonalizedContentOutput - The return type for the personalizedContentSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedContentInputSchema = z.object({
  assessmentResults: z
    .string()
    .describe('The results from the mental health assessment.'),
  preferences: z.string().describe('The user preferences for content.'),
});
export type PersonalizedContentInput = z.infer<typeof PersonalizedContentInputSchema>;

const PersonalizedContentOutputSchema = z.object({
  articles: z.array(z.string()).describe('A list of suggested article titles.'),
  meditations: z.array(z.string()).describe('A list of suggested meditation titles.'),
  exercises: z.array(z.string()).describe('A list of suggested exercise names.'),
});
export type PersonalizedContentOutput = z.infer<typeof PersonalizedContentOutputSchema>;

export async function personalizedContentSuggestions(
  input: PersonalizedContentInput
): Promise<PersonalizedContentOutput> {
  return personalizedContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedContentPrompt',
  input: {schema: PersonalizedContentInputSchema},
  output: {schema: PersonalizedContentOutputSchema},
  prompt: `Based on the mental health assessment results: {{{assessmentResults}}} and user preferences: {{{preferences}}}, suggest relevant articles, meditations, and exercises.

Return the articles, meditations and exercises as arrays of strings.
`,
});

const personalizedContentFlow = ai.defineFlow(
  {
    name: 'personalizedContentFlow',
    inputSchema: PersonalizedContentInputSchema,
    outputSchema: PersonalizedContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
