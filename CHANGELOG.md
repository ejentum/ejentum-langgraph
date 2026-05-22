# Changelog

All notable changes to `ejentum-langgraph` are documented here. This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-05-23

### Added

- Initial release.
- `createEjentumTools(config)` factory returns an array of four `DynamicStructuredTool` instances built with LangChain's `tool()` from `@langchain/core/tools`. Pass directly to `createReactAgent({ tools: [...] })` from `@langchain/langgraph/prebuilt` or `createAgent({ tools: [...] })` from `langchain`.
- Per-tool factories also exported: `createReasoningTool`, `createCodeTool`, `createAntiDeceptionTool`, `createMemoryTool`.
- Tool names use `snake_case` (`harness_reasoning`, `harness_code`, `harness_anti_deception`, `harness_memory`) per LangChain's docs recommendation for cross-provider compatibility.
- Native `fetch` (Node 18+) with `AbortController`-based timeout. No HTTP-client dep weight beyond `@langchain/core` and `zod` (both peer deps).
- Construction-time and call-time validation: empty/whitespace query returns an actionable error without spending a paid API call. Missing `EJENTUM_API_KEY` returns an actionable error pointing to https://ejentum.com/pricing.
- Errors returned as human-readable strings for every failure path (no exceptions cross the tool boundary, so an agent step never crashes the run).
- TypeScript-first with declaration files (`.d.ts`) and source maps. Strict mode enabled.
- Unit tests via vitest cover the factory contract (four named tools with `name` / `description` / `schema`, returns as array not object), per-tool factory descriptions, and the call helper failure surface (missing key, empty/whitespace/non-string query, invalid mode, 401, non-200, invalid JSON, unexpected shape, non-string scaffold, network error).
- Published to npm with `--provenance` provenance attestation via GitHub Actions OIDC.

### Background

LangChain.js / LangGraph.js expects `tools` as an array (not an object map like Vercel AI SDK or Mastra). This is the shape difference captured by `createEjentumTools` returning `DynamicStructuredTool[]`. The Ejentum MCP server (`ejentum-mcp`) is also consumable from LangGraph via the LangChain MCP adapters; this package is the direct REST alternative.
