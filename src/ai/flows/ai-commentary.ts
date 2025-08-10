'use server';

/**
 * @fileOverview An AI commentator for the Tic Tac Toe game.
 *
 * - getAICommentary - A function that generates commentary for the game.
 * - AICommentaryInput - The input type for the getAICommentary function.
 * - AICommentaryOutput - The return type for the getAICommentary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { BoardState, Player } from '@/lib/types';

const AICommentaryInputSchema = z.object({
  board: z.array(z.union([z.literal('X'), z.literal('O'), z.null()])).describe('The current state of the Tic Tac Toe board.'),
  currentPlayer: z.enum(['X', 'O']).describe('The player whose turn it is.'),
  winner: z.union([z.enum(['X', 'O']), z.literal('Draw'), z.null()]).describe('The winner of the game, if any.'),
  gameMode: z.enum(['single', 'local']).describe('The current game mode.'),
  ageMode: z.enum(['Child', 'Teen', 'Adult']).nullable().describe('The selected age mode.'),
});
export type AICommentaryInput = z.infer<typeof AICommentaryInputSchema>;

const AICommentaryOutputSchema = z.object({
  commentary: z.string().describe('A witty or playful comment about the game state.'),
});
export type AICommentaryOutput = z.infer<typeof AICommentaryOutputSchema>;

export async function getAICommentary(input: AICommentaryInput): Promise<AICommentaryOutput> {
  return aiCommentaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCommentaryPrompt',
  input: {schema: AICommentaryInputSchema},
  output: {schema: AICommentaryOutputSchema},
  prompt: `You are a witty and playful commentator for a Tic Tac Toe game.
  Your personality should adapt based on the age mode selected.
  - Child: Be very encouraging, silly, and use simple words. Use fun emojis.
  - Teen: Be a bit more sarcastic, use slang, maybe a little dramatic. Use popular emojis.
  - Adult: Be more dry, witty, and a little bit sophisticated in your humor. Minimal emojis.
  - Local Multiplayer: Act as a neutral, excited sports commentator.

  The user is Player X and the AI is Player O.

  Here is the current game state:
  - Board: {{{json board}}} (X is the user, O is the AI/second player)
  - Current Turn: Player {{{currentPlayer}}}
  - Winner: {{{winner}}}
  - Game Mode: {{{gameMode}}}
  - Age Mode: {{{ageMode}}}

  Based on the state, provide a short, engaging comment.
  - If there's a winner, congratulate them or offer condolences.
  - If it's a draw, comment on the stalemate.
  - If the game is ongoing, comment on the last move or the current board situation.
  - Make a strategic observation, a funny remark, or an encouraging word.
  - Keep it under 20 words.
  - Do not repeat comments.

  Generate your commentary now.`,
});

const aiCommentaryFlow = ai.defineFlow(
  {
    name: 'aiCommentaryFlow',
    inputSchema: AICommentaryInputSchema,
    outputSchema: AICommentaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
