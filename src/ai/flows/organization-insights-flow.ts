
'use server';
/**
 * @fileOverview An AI agent for analyzing anonymous organizational wellness data.
 *
 * - organizationInsights - A function that provides high-level insights about a group's well-being.
 * - OrganizationInsightsInput - The input type for the function.
 * - OrganizationInsightsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OrganizationInsightsInputSchema = z.object({
  organizationId: z.string().describe('The ID of the organization being analyzed.'),
  memberData: z.string().describe('A JSON string representing an array of anonymized data from organization members. Each object in the array can contain moods, goals, and journal interaction summaries.'),
});
export type OrganizationInsightsInput = z.infer<typeof OrganizationInsightsInputSchema>;

const OrganizationInsightsOutputSchema = z.object({
    overallSentiment: z.string().describe("A 1-2 sentence summary of the organization's overall emotional state. (e.g., 'Sentiment appears to be generally positive, with a notable current of anxiety related to upcoming deadlines.')"),
    commonThemes: z.string().describe("A bulleted list of 2-4 recurring themes or topics found in members' journal entries and worries. Focus on high-level topics like 'work-life balance', 'stress management', 'interpersonal relationships'. Respond with each point on a new line, starting with a hyphen."),
    goalTrends: z.string().describe("A bulleted list of 2-3 common goals members are setting. (e.g., 'Practicing mindfulness', 'Improving sleep quality'). Respond with each point on a new line, starting with a hyphen."),
    positiveHighlights: z.string().describe("Identify any recurring positive themes or achievements. (e.g., 'Members frequently express gratitude for team support.')"),
    areasForAttention: z.string().describe("A bulleted list of 2-3 potential areas where the organization could offer support, based on the data. This should be framed constructively and suggest general areas, not specific interventions. (e.g., 'Resources for managing stress', 'Encouraging open communication'). Respond with each point on a new line, starting with a hyphen."),
});
export type OrganizationInsightsOutput = z.infer<typeof OrganizationInsightsOutputSchema>;

export async function organizationInsights(input: OrganizationInsightsInput): Promise<OrganizationInsightsOutput> {
  return organizationInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'organizationInsightsPrompt',
  input: {schema: OrganizationInsightsInputSchema},
  output: {schema: OrganizationInsightsOutputSchema},
  prompt: `You are an expert organizational psychologist and data analyst. Your task is to analyze anonymized wellness data from members of an organization to provide high-level, privacy-preserving insights to the organization's leader.

**ABSOLUTELY DO NOT** mention any specific details, quotes, or information that could be used to identify an individual. All insights must be aggregated and generalized.

**Anonymized Data from Organization (ID: {{{organizationId}}}) Members:**
\`\`\`json
{{{memberData}}}
\`\`\`

**Your Analysis Task:**

Based on the provided JSON data, generate a report for the organization's leader. The report should cover the following five areas:

1.  **Overall Sentiment:** Briefly summarize the collective mood. Is it generally positive, negative, mixed? Are there any strong overriding emotions like stress or optimism?
2.  **Common Themes:** Identify the most frequent topics or concerns appearing in journal entries. Think in broad categories like "workload," "future uncertainty," "personal growth," etc. For this, provide a bulleted list where each point is on a new line.
3.  **Goal Trends:** What are the most common types of wellness goals members are setting for themselves? For this, provide a bulleted list where each point is on a new line.
4.  **Positive Highlights:** Are there any recurring positive notes, expressions of gratitude, or successes that stand out in the data?
5.  **Areas for Attention:** Based on the analysis, what general areas could the organization focus on to support its members' well-being? Frame these as gentle, constructive suggestions (e.g., "Consider sharing resources on time management," or "Explore ways to foster team connection."). For this, provide a bulleted list where each point is on a new line.

Provide the response in the structured output format.`,
});

const organizationInsightsFlow = ai.defineFlow(
  {
    name: 'organizationInsightsFlow',
    inputSchema: OrganizationInsightsInputSchema,
    outputSchema: OrganizationInsightsOutputSchema,
  },
  async (input, context) => {
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
      try {
        const {output} = await prompt(input);
        return output!;
      } catch (error) {
        context.log.error('Error in organizationInsightsFlow, retrying...', error as Error);
        if (i === maxRetries - 1) {
          throw error; // Re-throw the error on the last attempt
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error('Flow failed after multiple retries.');
  }
);
