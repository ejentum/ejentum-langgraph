/**
 * ejentum-langgraph: LangGraph.js / LangChain.js integration for the Ejentum Reasoning Harness.
 *
 * Re-exports the four Ejentum harness tools (built with LangChain's
 * `tool()` from `@langchain/core/tools`) and the `createEjentumTools()`
 * array factory. Pass the array directly to `createReactAgent` from
 * `@langchain/langgraph/prebuilt` or `createAgent` from `langchain`.
 *
 * Free and paid tiers at https://ejentum.com/pricing.
 */

export {
  createEjentumTools,
  createReasoningTool,
  createCodeTool,
  createAntiDeceptionTool,
  createMemoryTool,
} from "./tools.js";

export {
  callLogicApi,
  DEFAULT_API_URL,
  DEFAULT_TIMEOUT_MS,
  VALID_MODES,
  type EjentumConfig,
  type HarnessMode,
} from "./api.js";

export const VERSION = "0.1.0";
