import type { WebMCPTool } from './types';

export interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: Array<{
    function: {
      name: string;
      arguments: Record<string, any> | string;
    };
  }>;
}

export interface OllamaToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}

export function convertWebMCPToolsToOllama(tools: WebMCPTool[]): OllamaToolDefinition[] {
  return tools.map((t) => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.inputSchema,
    },
  }));
}

export class OllamaClient {
  private endpoint: string;
  private model: string;

  constructor(endpoint: string = 'http://localhost:11434', model: string = 'llama3.2') {
    this.endpoint = endpoint.replace(/\/+$/, '');
    this.model = model;
  }

  async isOnline(): Promise<boolean> {
    try {
      const res = await fetch(`${this.endpoint}/api/tags`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  }

  async chat(messages: OllamaChatMessage[], tools?: OllamaToolDefinition[]): Promise<OllamaChatMessage> {
    const res = await fetch(`${this.endpoint}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages,
        tools: tools && tools.length > 0 ? tools : undefined,
        stream: false,
      }),
    });

    if (!res.ok) {
      throw new Error(`Ollama chat request failed with status ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    return data.message;
  }
}
