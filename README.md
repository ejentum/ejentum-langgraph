# ejentum-langgraph

[LangGraph.js](https://langchain-ai.github.io/langgraphjs/) and [LangChain.js](https://js.langchain.com) integration for the Ejentum Reasoning Harness. `createEjentumTools()` returns an array of eight `DynamicStructuredTool` instances you pass as the `tools` argument to `createReactAgent`, `createAgent`, `ToolNode`, or any LangChain graph node that accepts tools.

Four dynamic tools (`reasoning`, `code`, `anti-deception`, `memory`) are available on all tiers including the 30-day free trial. Four adaptive tools (`adaptive-reasoning`, `adaptive-code`, `adaptive-anti-deception`, `adaptive-memory`) additionally run an adapter LLM that rewrites the matched operation with task-specific identifiers; they require the Go or Super tier.

## Install

```bash
npm install ejentum-langgraph
# peer deps
npm install @langchain/core zod
```

## Configuration

```bash
export EJENTUM_API_KEY="ej_..."
```

Or pass it explicitly: `createEjentumTools({ apiKey: "..." })`. Get a key at [ejentum.com/pricing](https://ejentum.com/pricing).

## Usage

### With `createReactAgent` (LangGraph.js)

```ts
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatAnthropic } from "@langchain/anthropic";
import { createEjentumTools } from "ejentum-langgraph";

const agent = createReactAgent({
  llm: new ChatAnthropic({ model: "claude-sonnet-4-6" }),
  tools: createEjentumTools(),
});

const result = await agent.invoke({
  messages: [{ role: "user", content: "Should we keep the GraphQL gateway or pivot to REST?" }],
});
```

### With `createAgent` (LangChain v1.x)

```ts
import { createAgent } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { createEjentumTools } from "ejentum-langgraph";

const agent = createAgent({
  model: new ChatOpenAI({ model: "gpt-4o" }),
  tools: createEjentumTools(),
});
```

### Inside a graph node

```ts
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { createEjentumTools } from "ejentum-langgraph";

const toolNode = new ToolNode(createEjentumTools());
```

### Pick a subset

```ts
import { createReasoningTool, createAntiDeceptionTool } from "ejentum-langgraph";

const tools = [createReasoningTool(), createAntiDeceptionTool()];
```

## Tool inventory

The LLM-facing tool name is the `name` field on each tool (set by the factory; canonical hyphenated strings).

| Factory | Tool `name` (LLM-visible) | Mode string | Library size |
|---|---|---|---:|
| `createReasoningTool` | `reasoning` | `reasoning` | 311 |
| `createCodeTool` | `code` | `code` | 128 |
| `createAntiDeceptionTool` | `anti-deception` | `anti-deception` | 139 |
| `createMemoryTool` | `memory` | `memory` | 101 |
| `createAdaptiveReasoningTool` | `adaptive-reasoning` | `adaptive-reasoning` | (same pool) |
| `createAdaptiveCodeTool` | `adaptive-code` | `adaptive-code` | (same pool) |
| `createAdaptiveAntiDeceptionTool` | `adaptive-anti-deception` | `adaptive-anti-deception` | (same pool) |
| `createAdaptiveMemoryTool` | `adaptive-memory` | `adaptive-memory` | (same pool) |

Each tool takes one parameter, `query: string`, and returns the injection as plain text. Errors return as human-readable strings rather than thrown exceptions.

## API reference

```ts
import { createEjentumTools, type EjentumConfig, type HarnessMode } from "ejentum-langgraph";

createEjentumTools(config?: EjentumConfig): DynamicStructuredTool[]
```

| `EjentumConfig` field | Default | Description |
|---|---|---|
| `apiKey` | `process.env.EJENTUM_API_KEY` | API key. |
| `apiUrl` | `https://api.ejentum.com/harness/` | Override for self-hosted gateway. |
| `timeoutMs` | `10000` | Per-call HTTP timeout. |

## Wire contract

`createEjentumTools()` issues:

```
POST https://api.ejentum.com/harness/
Headers: Authorization: Bearer <key>, Content-Type: application/json
Body:    { "query": <string>, "mode": <one of 8 mode strings> }
Response (200): [ { "<mode>": "<injection string>" } ]
```

Full wire contract, field structure, DAG syntax, and a canonical dynamic-vs-adaptive comparison on the same query are documented in the [ejentum-mcp README](https://github.com/ejentum/ejentum-mcp#wire-contract). The format is identical across this package and every Ejentum shim.

## ejentum-mcp alternative

LangGraph supports MCP via `@langchain/mcp-adapters`:

```ts
import { MultiServerMCPClient } from "@langchain/mcp-adapters";

const client = new MultiServerMCPClient({
  mcpServers: {
    ejentum: {
      url: "https://api.ejentum.com/mcp",
      headers: { Authorization: `Bearer ${process.env.EJENTUM_API_KEY}` },
      transport: "streamable_http",
    },
  },
});
const tools = await client.getTools();
```

## Compatibility

- Node.js 18+
- `@langchain/core` 0.3+ (peer dep `>=0.3.0`)
- Works with `@langchain/langgraph` 0.x and 1.x, and `langchain` 1.x
- `zod` 3.x (peer dep `^3.23.0`)
- TypeScript 5.x

## License

[MIT](./LICENSE)
