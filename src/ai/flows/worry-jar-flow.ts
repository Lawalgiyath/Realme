
'use server';
/**
 * @fileOverview Provides a calming response to a user's worry.
 *
 * - reframeWorry - A function that takes a user's worry and returns a reframed perspective.
 * - ReframeWorryInput - The input type for the reframeWorry function.
 * - ReframeWorryOutput - The return type for the reframeWorry function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReframeWorryInputSchema = z.object({
  worry: z
    .string()
    .describe('A worry or anxious thought submitted by the user.'),
});
export type ReframeWorryInput = z.infer<typeof ReframeWorryInputSchema>;

const ReframeWorryOutputSchema = z.object({
  reframedThought: z.string().describe('A short, calming, and constructive reframing of the user\'s worry. It should be gentle and supportive, under 40 words.'),
});
export type ReframeWorryOutput = z.infer<typeof ReframeWorryOutputSchema>;

export async function reframeWorry(
  input: ReframeWorryInput
): Promise<ReframeWorryOutput> {
  return worryJarFlow(input);
}

const prompt = ai.definePrompt({
  name: 'worryJarPrompt',
  input: {schema: ReframeWorryInputSchema},
  output: {schema: ReframeWorryOutputSchema},
  prompt: `You are a gentle and wise mindfulness coach. A user has shared a worry with you. Your task is to provide a single, short, calming, and constructive thought to help them reframe their worry. Be empathetic and encouraging. Keep the response under 40 words.

User's worry: "{{{worry}}}"

Your reframed thought:`,
});

const worryJarFlow = ai.defineFlow(
  {
    name: 'worryJarFlow',
    inputSchema: ReframeWorryInputSchema,
    outputSchema: ReframeWorryOutputSchema,
  },
  async (input, context) => {
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
      try {
        const {output} = await prompt(input);
        return output!;
      } catch (error) {
        context.log.error('Error in worryJarFlow, retrying...', error as Error);
        if (i === maxRetries - 1) {
          throw error; // Re-throw the error on the last attempt
        }
        // Wait for a short period before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    // This part should not be reachable if the loop is correct, but for type safety:
    throw new Error('Flow failed after multiple retries.');
  }
);
