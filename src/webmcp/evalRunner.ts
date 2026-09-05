import type { ModelContext } from './types';
import { OllamaClient, convertWebMCPToolsToOllama, type OllamaChatMessage } from './ollamaClient';
import { Schema } from 'effect';
import { Routine } from '../domain/routine';

export interface EvalResult {
  prompt: string;
  success: boolean;
  toolCallsMade: string[];
  createdRoutine?: Routine;
  error?: string;
}

export async function runOllamaAgentLoop(
  prompt: string,
  modelContext: ModelContext,
  client: OllamaClient,
  maxTurns: number = 5
): Promise<EvalResult> {
  const tools = modelContext.listTools();
  const ollamaTools = convertWebMCPToolsToOllama(tools);
  const toolCallsMade: string[] = [];

  const messages: OllamaChatMessage[] = [
    {
      role: 'system',
      content:
        'Você é o assistente inteligente de musculação do Lifta. Use as ferramentas WebMCP disponíveis para pesquisar exercícios e criar fichas de treino válidas quando solicitado pelo usuário.',
    },
    {
      role: 'user',
      content: prompt,
    },
  ];

  try {
    for (let turn = 0; turn < maxTurns; turn++) {
      const response = await client.chat(messages, ollamaTools);
      messages.push(response);

      if (!response.tool_calls || response.tool_calls.length === 0) {
        // Model finished turn without calling more tools
        break;
      }

      for (const call of response.tool_calls) {
        const toolName = call.function.name;
        toolCallsMade.push(toolName);

        const rawArgs = call.function.arguments;
        const parsedArgs = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs;

        let toolResult: any;
        try {
          toolResult = await modelContext.callTool(toolName, parsedArgs);
        } catch (toolErr: any) {
          toolResult = { error: toolErr?.message ?? String(toolErr) };
        }

        messages.push({
          role: 'tool',
          content: JSON.stringify(toolResult),
        });
      }
    }

    // Check if any routine was created in the process
    const allRoutinesTool = modelContext.getTool('list_routines');
    const { routines } = (await allRoutinesTool?.handler({})) ?? { routines: [] };
    const latest = routines[routines.length - 1];

    if (latest) {
      Schema.decodeUnknownSync(Routine)(latest);
    }

    return {
      prompt,
      success: toolCallsMade.length > 0,
      toolCallsMade,
      createdRoutine: latest,
    };
  } catch (err: any) {
    return {
      prompt,
      success: false,
      toolCallsMade,
      error: err?.message ?? String(err),
    };
  }
}
