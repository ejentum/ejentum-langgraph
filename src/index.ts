/**
 * ejentum-langgraph: LangGraph.js / LangChain.js integration for the Ejentum Reasoning Harness.
 *
 * Re-exports the eight Ejentum harness tools (four dynamic + four
 * adaptive) and the `createEjentumTools()` array factory. Pass the
 * array directly to `createReactAgent` from `@langchain/langgraph/prebuilt`
 * or `createAgent` from `langchain`.
 *
 * 30-day free trial, then €5 Go or €25 Super for adaptive tools.
 * Pricing at https://ejentum.com/pricing.
 */

export {
  createEjentumTools,
  createReasoningTool,
  createCodeTool,
  createAntiDeceptionTool,
  createMemoryTool,
  createAdaptiveReasoningTool,
  createAdaptiveCodeTool,
  createAdaptiveAntiDeceptionTool,
  createAdaptiveMemoryTool,
} from "./tools.js";

export {
  callLogicApi,
  DEFAULT_API_URL,
  DEFAULT_TIMEOUT_MS,
  VALID_MODES,
  type EjentumConfig,
  type HarnessMode,
} from "./api.js";

export const VERSION = "0.2.0";
