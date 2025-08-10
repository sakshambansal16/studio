'use server';

/**
 * @fileOverview An AI opponent difficulty adjustment flow.
 *
 * - adjustDifficulty - A function that adjusts AI difficulty based on the selected age mode.
 * - AdjustDifficultyInput - The input type for the adjustDifficulty function.
 * - AdjustDifficultyOutput - The return type for the adjustDifficulty function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustDifficultyInputSchema = z.object({
  ageMode: z
    .enum(['Child', 'Teen', 'Adult'])
    .describe('The selected age mode for the game.'),
});
export type AdjustDifficultyInput = z.infer<typeof AdjustDifficultyInputSchema>;

const AdjustDifficultyOutputSchema = z.object({
  difficultyLevel: z
    .number()
    .describe('The adjusted difficulty level for the AI opponent (1-10).'),
});
export type AdjustDifficultyOutput = z.infer<typeof AdjustDifficultyOutputSchema>;

export async function adjustDifficulty(input: AdjustDifficultyInput): Promise<AdjustDifficultyOutput> {
  return adjustDifficultyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adjustDifficultyPrompt',
  input: {schema: AdjustDifficultyInputSchema},
  output: {schema: AdjustDifficultyOutputSchema},
  prompt: `You are an AI difficulty adjustment expert for a Tic Tac Toe game.

  Based on the selected age mode, you will determine an appropriate difficulty level for the AI opponent. The difficulty level should be a number between 1 and 10, where 1 is the easiest and 10 is the most difficult.

  Age Mode: {{{ageMode}}}

  Determine the difficulty level based on the following guidelines:
  - Child: Difficulty level should be between 1 and 3.
  - Teen: Difficulty level should be between 4 and 7.
  - Adult: Difficulty level should be between 8 and 10.

  Return the difficulty level as a number.
  `,
});

const adjustDifficultyFlow = ai.defineFlow(
  {
    name: 'adjustDifficultyFlow',
    inputSchema: AdjustDifficultyInputSchema,
    outputSchema: AdjustDifficultyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
