import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

type SupabaseRuntimeEnv = {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_SERVICE_ROLE_KEY?: string;
  VITE_SUPABASE_SECRET_KEY?: string;
};

type ParsedSupabaseEnv = {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
};

const publishableKeySchema = z
  .string()
  .trim()
  .min(1, "VITE_SUPABASE_PUBLISHABLE_KEY is required.")
  .refine((value) => !looksLikeBackendOnlyKey(value), {
    message:
      "VITE_SUPABASE_PUBLISHABLE_KEY must contain a Supabase publishable key, not a backend-only secret or service-role key.",
  });

function looksLikeBackendOnlyKey(value: string) {
  const normalizedValue = value.trim().toLowerCase();

  return normalizedValue.startsWith("sb_secret_") || normalizedValue.includes("service_role");
}

function normalizeEnvValue(value: string | undefined) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : undefined;
}

function normalizeSupabaseRuntimeEnv(source: SupabaseRuntimeEnv): SupabaseRuntimeEnv {
  return {
    VITE_SUPABASE_URL: normalizeEnvValue(source.VITE_SUPABASE_URL),
    VITE_SUPABASE_PUBLISHABLE_KEY: normalizeEnvValue(source.VITE_SUPABASE_PUBLISHABLE_KEY),
    VITE_SUPABASE_ANON_KEY: normalizeEnvValue(source.VITE_SUPABASE_ANON_KEY),
    VITE_SUPABASE_SERVICE_ROLE_KEY: normalizeEnvValue(source.VITE_SUPABASE_SERVICE_ROLE_KEY),
    VITE_SUPABASE_SECRET_KEY: normalizeEnvValue(source.VITE_SUPABASE_SECRET_KEY),
  };
}

function ensureNoBackendOnlySupabaseKeys(source: SupabaseRuntimeEnv) {
  const backendOnlyKeys = [
    "VITE_SUPABASE_SERVICE_ROLE_KEY",
    "VITE_SUPABASE_SECRET_KEY",
  ] as const;

  const foundKey = backendOnlyKeys.find((key) => source[key]);

  if (foundKey) {
    throw new Error(`${foundKey} is backend-only and must not be exposed in browser env.`);
  }
}

export function parseSupabaseEnv(source: SupabaseRuntimeEnv): ParsedSupabaseEnv {
  const runtimeEnv = normalizeSupabaseRuntimeEnv(source);

  ensureNoBackendOnlySupabaseKeys(runtimeEnv);

  const parsedEnv = createEnv({
    clientPrefix: "VITE_",
    client: {
      VITE_SUPABASE_URL: z.string().trim().url("VITE_SUPABASE_URL must be a valid URL.").optional(),
      VITE_SUPABASE_PUBLISHABLE_KEY: publishableKeySchema.optional(),
      VITE_SUPABASE_ANON_KEY: publishableKeySchema.optional(),
    },
    runtimeEnv,
    emptyStringAsUndefined: true,
    onValidationError: (issues) => {
      const issueMessage = issues.map((issue) => issue.message).join(" ");
      throw new Error(issueMessage || "Invalid Supabase environment configuration.");
    },
  });

  return {
    VITE_SUPABASE_URL: parsedEnv.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY:
      parsedEnv.VITE_SUPABASE_PUBLISHABLE_KEY ?? parsedEnv.VITE_SUPABASE_ANON_KEY,
  };
}

export function requireSupabaseEnv(source: SupabaseRuntimeEnv): {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_PUBLISHABLE_KEY: string;
} {
  const parsedEnv = parseSupabaseEnv(source);

  if (!parsedEnv.VITE_SUPABASE_URL) {
    throw new Error("VITE_SUPABASE_URL is required to configure the Supabase browser client.");
  }

  if (!parsedEnv.VITE_SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      "VITE_SUPABASE_PUBLISHABLE_KEY is required to configure the Supabase browser client."
    );
  }

  return {
    VITE_SUPABASE_URL: parsedEnv.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: parsedEnv.VITE_SUPABASE_PUBLISHABLE_KEY,
  };
}

export function isSupabaseConfigured(
  source: SupabaseRuntimeEnv = import.meta.env as SupabaseRuntimeEnv
) {
  try {
    const parsedEnv = parseSupabaseEnv(source);
    return Boolean(parsedEnv.VITE_SUPABASE_URL && parsedEnv.VITE_SUPABASE_PUBLISHABLE_KEY);
  } catch {
    return false;
  }
}
