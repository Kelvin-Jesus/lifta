import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { createModelContext } from '../modelContextPolyfill';
import { registerAllWebMCPTools } from '../tools';
import { OllamaClient } from '../ollamaClient';
import { runOllamaAgentLoop } from '../evalRunner';

describe('Ollama WebMCP Agent Eval Runner', () => {
  let context: ReturnType<typeof createModelContext>;

  beforeEach(() => {
    indexedDB = new IDBFactory();
    context = createModelContext();
    registerAllWebMCPTools(context);
  });

  it('executes simulated tool-calling agent loop when given natural language workout request', async () => {
    const mockClient = new OllamaClient('http://localhost:11434', 'llama3.2');

    // Mock chat responses:
    // Turn 1: Model decides to call search_exercises
    // Turn 2: Model decides to call create_routine
    // Turn 3: Model responds to user with confirmation
    vi.spyOn(mockClient, 'chat')
      .mockResolvedValueOnce({
        role: 'assistant',
        content: '',
        tool_calls: [
          {
            function: {
              name: 'search_exercises',
              arguments: { muscleGroup: 'chest' },
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        role: 'assistant',
        content: '',
        tool_calls: [
          {
            function: {
              name: 'create_routine',
              arguments: {
                name: 'Treino A - Peitoral e Tríceps',
                scheduledDays: ['monday'],
                exercises: [
                  { exerciseId: 'bench-press', targetSets: 4 },
                  { exerciseId: 'push-up', targetSets: 3 },
                ],
              },
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        role: 'assistant',
        content: 'Criei sua rotina de Peitoral e Tríceps com sucesso no banco de dados local!',
      });

    const result = await runOllamaAgentLoop(
      'Crie uma rotina de treino de peito para segunda-feira',
      context,
      mockClient
    );

    expect(result.success).toBe(true);
    expect(result.toolCallsMade).toContain('search_exercises');
    expect(result.toolCallsMade).toContain('create_routine');
    expect(result.createdRoutine).toBeDefined();
    expect(result.createdRoutine?.name).toBe('Treino A - Peitoral e Tríceps');
  });
});
