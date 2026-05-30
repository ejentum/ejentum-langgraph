/**
 * LangChain.js `tool()` factories for the Ejentum Reasoning Harness.
 *
 * Eight tools: four dynamic (`reasoning`, `code`, `anti-deception`,
 * `memory`) and four adaptive (`adaptive-reasoning`, `adaptive-code`,
 * `adaptive-anti-deception`, `adaptive-memory`) that pre-fit the
 * cognitive operation to the caller's task via an adapter LLM.
 * Adaptive tools require the Go or Super tier.
 *
 * Tool name (the `name` field, visible to the LLM) equals the API mode
 * string. The factory functions use camelCase developer-friendly names.
 *
 * The bracketed labels in the returned injection (`[NEGATIVE GATE]`,
 * `[PROCEDURE]`, `[REASONING TOPOLOGY]`, etc.) are instructions to the
 * agent, not content to display.
 */

import { tool, type DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

import { callLogicApi, type EjentumConfig } from "./api.js";

const querySchema = z.object({
  query: z
    .string()
    .min(1)
    .describe(
      "A 1-2 sentence description of the task the agent is about to " +
        "work on. Be specific about the failure mode to avoid. For " +
        "memory and adaptive-memory, format as: 'I noticed [X]. This " +
        "might mean [Y]. Sharpen: [Z].'",
    ),
});

// ---------------------------------------------------------------------------
// Dynamic tools (single retrieval, all tiers including the 30-day trial)
// ---------------------------------------------------------------------------

export function createReasoningTool(
  config: EjentumConfig = {},
): DynamicStructuredTool {
  return tool(
    async ({ query }) => callLogicApi("reasoning", query, config),
    {
      name: "reasoning",
      description:
        "Retrieve a reasoning injection before any analytical, " +
        "diagnostic, planning, or multi-step task. Returns a structured " +
        "injection with a named failure pattern, an executable procedure, " +
        "a reasoning topology (graph DAG), and a falsification test from " +
        "a library of 311 reasoning operations.",
      schema: querySchema,
    },
  );
}

export function createCodeTool(
  config: EjentumConfig = {},
): DynamicStructuredTool {
  return tool(
    async ({ query }) => callLogicApi("code", query, config),
    {
      name: "code",
      description:
        "Retrieve a code injection before any code generation, " +
        "refactoring, review, or debugging task. Returns a structured " +
        "injection with a named code-failure pattern, an engineering " +
        "procedure, a reasoning topology (graph DAG), and a verification " +
        "step from a library of 128 code operations.",
      schema: querySchema,
    },
  );
}

export function createAntiDeceptionTool(
  config: EjentumConfig = {},
): DynamicStructuredTool {
  return tool(
    async ({ query }) => callLogicApi("anti-deception", query, config),
    {
      name: "anti-deception",
      description:
        "Retrieve an anti-deception injection before responding to any " +
        "prompt that pressures the agent to validate, certify, or soften " +
        "an honest assessment. Returns a structured injection with a " +
        "named deception pattern, an integrity procedure, a detection " +
        "topology (graph DAG with omission-bias gates), and an integrity " +
        "check from a library of 139 operations.",
      schema: querySchema,
    },
  );
}

export function createMemoryTool(
  config: EjentumConfig = {},
): DynamicStructuredTool {
  return tool(
    async ({ query }) => callLogicApi("memory", query, config),
    {
      name: "memory",
      description:
        "Retrieve a memory-mode injection ONLY when sharpening an " +
        "observation the agent has already formed about cross-turn " +
        "drift or pattern. Filter-oriented, not write-oriented. Format " +
        "'query' as: 'I noticed [X]. This might mean [Y]. Sharpen: [Z].' " +
        "Library of 101 perception operations.",
      schema: querySchema,
    },
  );
}

// ---------------------------------------------------------------------------
// Adaptive tools (top-k retrieval + LLM adapter rewrites operation to fit
// the specific task; requires Go or Super tier)
// ---------------------------------------------------------------------------

export function createAdaptiveReasoningTool(
  config: EjentumConfig = {},
): DynamicStructuredTool {
  return tool(
    async ({ query }) => callLogicApi("adaptive-reasoning", query, config),
    {
      name: "adaptive-reasoning",
      description:
        "Same triggers as `reasoning`, but the returned operation is " +
        "REWRITTEN by an adapter LLM to fit the specific task. Procedure " +
        "steps and topology DAG nodes are concretized with task-specific " +
        "language. Use when the dynamic tool is too generic, or for " +
        "high-stakes analytical work. Requires Go or Super tier. Cost ~2-3s.",
      schema: querySchema,
    },
  );
}

export function createAdaptiveCodeTool(
  config: EjentumConfig = {},
): DynamicStructuredTool {
  return tool(
    async ({ query }) => callLogicApi("adaptive-code", query, config),
    {
      name: "adaptive-code",
      description:
        "Same triggers as `code`, but the returned operation is REWRITTEN " +
        "by an adapter LLM to fit the specific code task: language, " +
        "framework, and failure modes are concretized in every step. Use " +
        "for security-critical reviews or refactor-heavy diffs. Requires " +
        "Go or Super tier. Cost ~2-3s.",
      schema: querySchema,
    },
  );
}

export function createAdaptiveAntiDeceptionTool(
  config: EjentumConfig = {},
): DynamicStructuredTool {
  return tool(
    async ({ query }) => callLogicApi("adaptive-anti-deception", query, config),
    {
      name: "adaptive-anti-deception",
      description:
        "Same triggers as `anti-deception`, but the returned operation is " +
        "REWRITTEN by an adapter LLM to fit the specific integrity " +
        "dynamic: detection topology gates are concretized to the exact " +
        "pressure at play. Use when stakes of a soft answer are high. " +
        "Requires Go or Super tier. Cost ~2-3s.",
      schema: querySchema,
    },
  );
}

export function createAdaptiveMemoryTool(
  config: EjentumConfig = {},
): DynamicStructuredTool {
  return tool(
    async ({ query }) => callLogicApi("adaptive-memory", query, config),
    {
      name: "adaptive-memory",
      description:
        "Same triggers as `memory`, but the returned operation is " +
        "REWRITTEN by an adapter LLM to fit the specific observation. " +
        "Perception topology nodes are concretized to the specific signal. " +
        "Observe FIRST, then call. Requires Go or Super tier. Cost ~2-3s.",
      schema: querySchema,
    },
  );
}

/**
 * Create all eight Ejentum harness tools with shared config as an
 * array. LangGraph / LangChain expect `tools: [...]` (array).
 *
 * ```ts
 * import { createReactAgent } from "@langchain/langgraph/prebuilt";
 * import { ChatAnthropic } from "@langchain/anthropic";
 * import { createEjentumTools } from "ejentum-langgraph";
 *
 * const agent = createReactAgent({
 *   llm: new ChatAnthropic({ model: "claude-sonnet-4-6" }),
 *   tools: createEjentumTools(),
 * });
 * ```
 *
 * @param config Shared Ejentum config (`apiKey`, `apiUrl`,
 *   `timeoutMs`). If `apiKey` is omitted, each tool reads
 *   `EJENTUM_API_KEY` from the environment at call time.
 */
export function createEjentumTools(
  config: EjentumConfig = {},
): DynamicStructuredTool[] {
  return [
    createReasoningTool(config),
    createCodeTool(config),
    createAntiDeceptionTool(config),
    createMemoryTool(config),
    createAdaptiveReasoningTool(config),
    createAdaptiveCodeTool(config),
    createAdaptiveAntiDeceptionTool(config),
    createAdaptiveMemoryTool(config),
  ];
}
