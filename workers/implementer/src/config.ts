import { z } from "zod";

/**
 * Neutral implementation-backend contract. Only variable names appear in the
 * public repository; real values live in the deployment secret manager.
 */
const backendEnvSchema = z.object({
  IMPLEMENTER_BACKEND_URL: z.url(),
  IMPLEMENTER_BACKEND_TOKEN: z.string().min(1),
  IMPLEMENTER_BACKEND_COMPANY_ID: z.string().min(1),
  IMPLEMENTER_BACKEND_PROJECT_ID: z.string().min(1),
  IMPLEMENTER_BACKEND_AGENT_ID: z.string().min(1),
});

export interface BackendConfig {
  baseUrl: string;
  token: string;
  companyId: string;
  projectId: string;
  agentId: string;
}

export function loadBackendConfig(
  env: Record<string, string | undefined>,
): BackendConfig {
  const parsed = backendEnvSchema.parse(env);
  return {
    baseUrl: parsed.IMPLEMENTER_BACKEND_URL.replace(/\/+$/, ""),
    token: parsed.IMPLEMENTER_BACKEND_TOKEN,
    companyId: parsed.IMPLEMENTER_BACKEND_COMPANY_ID,
    projectId: parsed.IMPLEMENTER_BACKEND_PROJECT_ID,
    agentId: parsed.IMPLEMENTER_BACKEND_AGENT_ID,
  };
}
