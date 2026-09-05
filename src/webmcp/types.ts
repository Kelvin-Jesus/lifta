export interface WebMCPTool<P = any, R = any> {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  outputSchema?: Record<string, any>;
  requiresApproval?: boolean;
  handler: (params: P, signal?: AbortSignal) => Promise<R>;
}

export type ApprovalHandler = (toolName: string, params: any) => Promise<boolean>;

export interface ModelContext {
  registerTool: (tool: WebMCPTool) => void;
  getTool: (name: string) => WebMCPTool | undefined;
  listTools: () => WebMCPTool[];
  callTool: <P = any, R = any>(name: string, params: P, signal?: AbortSignal) => Promise<R>;
  setApprovalHandler: (handler: ApprovalHandler) => void;
}

declare global {
  interface Document {
    modelContext?: ModelContext;
  }
}
