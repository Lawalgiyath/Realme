// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview AI-powered mental health assessment flow.
 *
 * This flow takes user's answers to a series of questions and provides personalized insights and
 * recommendations for mental health resources.
 *
 * @exports mentalHealthAssessment - The main function to trigger the mental health assessment flow.
 * @exports MentalHealthAssessmentInput - The input type for the mentalHealthAssessment function.
 * @exports MentalHealthAssessmentOutput - The output type for the mentalHealthAssessment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MentalHealthAssessmentInputSchema = z.object({
  answers: z.array(
    z.string().describe('Answer to a mental health assessment question')
  ).describe('List of answers to mental health assessment questions'),
});

export type MentalHealthAssessmentInput = z.infer<typeof MentalHealthAssessmentInputSchema>;

const MentalHealthAssessmentOutputSchema = z.object({
  insights: z.string().describe('Personalized insights based on the assessment answers'),
  recommendations: z.string().describe('Recommended mental health resources'),
});

export type MentalHealthAssessmentOutput = z.infer<typeof MentalHealthAssessmentOutputSchema>;

export async function mentalHealthAssessment(input: MentalHealthAssessmentInput): Promise<MentalHealthAssessmentOutput> {
  return mentalHealthAssessmentFlow(input);
}

const mentalHealthAssessmentPrompt = ai.definePrompt({
  name: 'mentalHealthAssessmentPrompt',
  input: {schema: MentalHealthAssessmentInputSchema},
  output: {schema: MentalHealthAssessmentOutputSchema},
  prompt: `You are an AI mental health assistant. Analyze the user's answers to the following mental health assessment questions and provide personalized insights and recommendations for mental health resources.

Answers: {{#each answers}}{{{this}}}\n{{/each}}`,
});

const mentalHealthAssessmentFlow = ai.defineFlow(
  {
    name: 'mentalHealthAssessmentFlow',
    inputSchema: MentalHealthAssessmentInputSchema,
    outputSchema: MentalHealthAssessmentOutputSchema,
  },
  async input => {
    const {output} = await mentalHealthAssessmentPrompt(input);
    return output!;
  }
);
