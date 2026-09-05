import type { ModelContext, WebMCPTool, ApprovalHandler } from './types';

export function createModelContext(): ModelContext {
  const tools = new Map<string, WebMCPTool>();
  let approvalHandler: ApprovalHandler = async (_tool, _params) => true;

  const context: ModelContext = {
    registerTool: (tool: WebMCPTool) => {
      tools.set(tool.name, tool);
    },

    getTool: (name: string) => {
      return tools.get(name);
    },

    listTools: () => {
      return Array.from(tools.values());
    },

    setApprovalHandler: (handler: ApprovalHandler) => {
      approvalHandler = handler;
    },

    callTool: async <P = any, R = any>(name: string, params: P, signal?: AbortSignal): Promise<R> => {
      if (signal?.aborted) {
        throw new Error('Operação cancelada por AbortSignal');
      }

      const tool = tools.get(name);
      if (!tool) {
        throw new Error(`Ferramenta WebMCP não encontrada: ${name}`);
      }

      // Check human-in-the-loop approval for destructive operations
      if (tool.requiresApproval) {
        const approved = await approvalHandler(name, params);
        if (!approved) {
          throw new Error(`Operação '${name}' cancelada pelo usuário (aprovação recusada)`);
        }
      }

      return tool.handler(params, signal);
    },
  };

  return context;
}

export function initWebMCPPolyfill(): ModelContext {
  if (typeof document === 'undefined') {
    return createModelContext();
  }

  if (!document.modelContext) {
    document.modelContext = createModelContext();
  }

  // Set up window.postMessage bridge for external test runners & browser extensions
  if (typeof window !== 'undefined') {
    window.addEventListener('message', async (event) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'WEBMCP_LIST_TOOLS') {
        const list = document.modelContext?.listTools().map((t) => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
          outputSchema: t.outputSchema,
          requiresApproval: t.requiresApproval,
        }));
        window.postMessage(
          {
            type: 'WEBMCP_TOOLS_LIST',
            id: data.id,
            tools: list ?? [],
          },
          '*'
        );
      } else if (data.type === 'WEBMCP_CALL') {
        const { id, tool, params } = data;
        try {
          const result = await document.modelContext?.callTool(tool, params);
          window.postMessage(
            {
              type: 'WEBMCP_RESPONSE',
              id,
              success: true,
              result,
            },
            '*'
          );
        } catch (err: any) {
          window.postMessage(
            {
              type: 'WEBMCP_RESPONSE',
              id,
              success: false,
              error: err?.message ?? String(err),
            },
            '*'
          );
        }
      }
    });

    // Notify environment that WebMCP is ready
    window.dispatchEvent(
      new CustomEvent('webmcp:ready', {
        detail: {
          toolsCount: document.modelContext.listTools().length,
        },
      })
    );
  }

  return document.modelContext;
}
