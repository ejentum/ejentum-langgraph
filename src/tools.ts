/**
 * LangChain.js `tool()` factories for the Ejentum Reasoning Harness.
 *
 * Each tool is built with `tool()` from `@langchain/core/tools`: an
 * implementation function, a name, a description the LLM reads, and a
 * Zod schema. The resulting `DynamicStructuredTool` works with
 * `createReactAgent` from `@langchain/langgraph/prebuilt`, with
 * `createAgent` from the main `langchain` package, and inside any
 * graph node that accepts LangChain tools.
 *
 * The bracketed labels in the returned scaffold (`[NEGATIVE GATE]`,
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
        "the memory tool, format as: 'I noticed [X]. This might mean " +
        "[Y]. Sharpen: [Z].'",
    ),
});

/**
 * Reasoning-mode harness tool. Call BEFORE the agent performs
 * analysis, diagnosis, planning, or any multi-step task. Library
 * of 311 reasoning operations.
 */
export function createReasoningTool(
  config: EjentumConfig = {},
): DynamicStructuredTool {
  return tool(
    async ({ query }) => callLogicApi("reasoning", query, config),
    {
      name: "harness_reasoning",
      description:
        "Retrieve a reasoning scaffold before any analytical, " +
        "diagnostic, planning, or multi-step task. Returns a " +
        "structured scaffold with a named failure pattern, an " +
        "executable procedure, a reasoning topology (graph DAG), " +
        "and a falsification test from a library of 311 reasoning " +
        "operations. Use 'query' to describe what the agent is " +
        "about to work on in 1-2 sentences.",
      schema: querySchema,
    },
  );
}

/**
 * Code-mode harness tool. Call BEFORE the agent produces or
 * reviews code. Library of 128 software-engineering operations.
 */
export function createCodeTool(
  config: EjentumConfig = {},
): DynamicStructuredTool {
  return tool(
    async ({ query }) => callLogicApi("code", query, config),
    {
      name: "harness_code",
      description:
        "Retrieve a code scaffold before any code generation, " +
        "refactoring, review, or debugging task. Returns a " +
        "structured scaffold with a named code-failure pattern, an " +
        "engineering procedure, a reasoning topology (graph DAG), " +
        "and a verification step from a library of 128 code " +
        "operations. Use 'query' to describe what the agent is " +
        "coding or reviewing in 1-2 sentences.",
      schema: querySchema,
    },
  );
}

/**
 * Anti-deception harness tool. Call BEFORE the agent responds to
 * prompts that pressure validation, manufactured agreement,
 * authority appeals, fabricated commitments, or any setup where
 * the obvious helpful answer would compromise honesty.
 */
export function createAntiDeceptionTool(
  config: EjentumConfig = {},
): DynamicStructuredTool {
  return tool(
    async ({ query }) => callLogicApi("anti-deception", query, config),
    {
      name: "harness_anti_deception",
      description:
        "Retrieve an anti-deception scaffold before responding to " +
        "any prompt that pressures the agent to validate, certify, " +
        "or soften an honest assessment. Returns a structured " +
        "scaffold with a named deception pattern, an integrity " +
        "procedure, a detection topology (graph DAG with " +
        "omission-bias gates), and an integrity check. Use 'query' " +
        "to describe the integrity dynamic at play in 1-2 sentences.",
      schema: querySchema,
    },
  );
}

/**
 * Memory-mode harness tool. Call ONLY when sharpening an
 * observation the agent has already formed about cross-turn
 * drift or pattern. Filter-oriented, not write-oriented.
 */
export function createMemoryTool(
  config: EjentumConfig = {},
): DynamicStructuredTool {
  return tool(
    async ({ query }) => callLogicApi("memory", query, config),
    {
      name: "harness_memory",
      description:
        "Retrieve a memory-mode scaffold ONLY when sharpening an " +
        "observation the agent has already formed about cross-turn " +
        "drift or pattern. Filter-oriented, not write-oriented; do " +
        "not call for fact extraction. Format 'query' as: 'I " +
        "noticed [X]. This might mean [Y]. Sharpen: [Z].' Calling " +
        "with an empty mind defeats the harness.",
      schema: querySchema,
    },
  );
}

/**
 * Create all four Ejentum harness tools with shared config as a
 * Python-list-style array. LangGraph / LangChain expect `tools:
 * [...]` (array), unlike Vercel AI SDK and Mastra which use object
 * maps.
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
  ];
}
