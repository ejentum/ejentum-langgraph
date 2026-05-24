# ejentum-langgraph

[LangGraph.js](https://langchain-ai.github.io/langgraphjs/) and [LangChain.js](https://js.langchain.com) integration for the [Ejentum](https://ejentum.com) Reasoning Harness. `createEjentumTools()` returns an array of four agent-callable tools (`harness_reasoning`, `harness_code`, `harness_anti_deception`, `harness_memory`) you pass to `createReactAgent({ tools })` or `createAgent({ tools })`.

Each operation in the Ejentum library (679 of them, organized across four harnesses) is engineered in **two layers**:

- a **natural-language procedure** the model can read, naming the steps to take and the failure pattern to refuse, and
- an **executable reasoning topology**: a graph-shaped plan over those steps. The plan names explicit decision points where the model branches, parallel branches that run and rejoin, bounded loops that run until convergence, named meta-cognitive moments where the model is asked to stop, look at its own working, and re-enter at a specific step, plus escape paths for when the prescribed plan stops fitting the task at hand.

The natural-language layer tells the model *what* to do. The topology layer pins down *how* those steps connect: where to decide, where to loop, where to stop and look at itself. Together they act as a persistent attention anchor that survives long context windows and multi-turn execution chains, which is precisely where a model's own reasoning template typically decays.

## Installation

```bash
npm install ejentum-langgraph
# peer deps (you almost certainly have these)
npm install @langchain/core zod
```

## Configuration

Get an Ejentum API key at <https://ejentum.com/pricing> (free and paid tiers) and set it in your environment:

```bash
export EJENTUM_API_KEY="zpka_..."
```

Or pass it explicitly: `createEjentumTools({ apiKey: "..." })`.

## Usage

### With `createReactAgent` (LangGraph.js)

```ts
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatAnthropic } from "@langchain/anthropic";
import { createEjentumTools } from "ejentum-langgraph";

const agent = createReactAgent({
  llm: new ChatAnthropic({ model: "claude-sonnet-4-6" }),
  tools: createEjentumTools(), // reads EJENTUM_API_KEY from env
});

const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content:
        "We've spent three months on the GraphQL gateway. " +
        "Should we keep going or pivot to REST?",
    },
  ],
});

console.log(result.messages.at(-1)?.content);
```

### With `createAgent` (LangChain v1.x main package)

```ts
import { createAgent } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { createEjentumTools } from "ejentum-langgraph";

const agent = createAgent({
  model: new ChatOpenAI({ model: "gpt-4o" }),
  tools: createEjentumTools(),
});
```

### Inside a graph node (LangGraph state machines)

```ts
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { createEjentumTools } from "ejentum-langgraph";

const toolNode = new ToolNode(createEjentumTools());
// ...attach to your StateGraph
```

### Pick a subset of harnesses

```ts
import { createReasoningTool, createAntiDeceptionTool } from "ejentum-langgraph";

const tools = [
  createReasoningTool(),
  createAntiDeceptionTool(),
  // ...your other non-Ejentum tools
];
```

### Explicit API key

```ts
const tools = createEjentumTools({ apiKey: "zpka_..." });
```

## The four tools

| Tool name (LLM-visible) | Best for | Library size |
|---|---|---|
| `harness_reasoning` | Analytical, diagnostic, planning, multi-step tasks | 311 operations |
| `harness_code` | Code generation, refactoring, review, debugging | 128 operations |
| `harness_anti_deception` | Prompts that pressure the agent to validate, certify, or soften an honest assessment | 139 operations |
| `harness_memory` | Sharpening an observation about cross-turn drift. Filter-oriented, not write-oriented. Format `query` as `"I noticed X. This might mean Y. Sharpen: Z."` | 101 operations |

Each tool returns a string. The bracketed labels in the returned scaffold (`[NEGATIVE GATE]`, `[PROCEDURE]`, `[REASONING TOPOLOGY]`, etc.) are instructions to the agent, not content to display.

## What an injection looks like

A real `reasoning` mode response on the query `investigate why our nightly ETL job has started failing intermittently over the past two weeks; nothing in the code or schema has changed`:

```
[NEGATIVE GATE]
The server's response time was accepted as average, despite a suspicious
rhythm break in its timing pattern.

[PROCEDURE]
Step 1: Establish baseline timing profiles by extracting historical
durations and intervals for each event type. Step 2: Compare each observed
timing against its baseline and compute deviation magnitude. ...

[REASONING TOPOLOGY]
S1:durations -> FIXED_POINT[baselines] -> N{dismiss_timing_deviations_
without_investigation} -> for_each: S2:compare -> S3:deviation ->
G1{>2sigma?} --yes-> S4:classify -> S5:probe_cause -> FLAG -> continue --no->
S6:validate -> continue -> all_checked -> OUT:anomaly_report

[FALSIFICATION TEST]
If no event timing is flagged as suspiciously fast or slow relative to
baseline, temporal anomaly detection was not active.

Amplify: timing baseline comparison; anomaly classification; security
context elevation
Suppress: average timing acceptance; outlier normalization
```

## API reference

```ts
import { createEjentumTools, type EjentumConfig } from "ejentum-langgraph";

createEjentumTools(config?: EjentumConfig): DynamicStructuredTool[]
```

| Config field | Default | Description |
|---|---|---|
| `apiKey` | `process.env.EJENTUM_API_KEY` | Ejentum Logic API key. |
| `apiUrl` | `https://ejentum-main-ab125c3.zuplo.app/logicv1/` | Override only if you self-host the gateway. |
| `timeoutMs` | `10000` | Per-call HTTP timeout in milliseconds. |

Per-tool factories: `createReasoningTool`, `createCodeTool`, `createAntiDeceptionTool`, `createMemoryTool`.

## ejentum-mcp alternative

LangGraph supports MCP via the LangChain MCP adapters:

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

This `ejentum-langgraph` package is the direct-REST path; MCP is the universal protocol path.

## Compatibility

- Node.js 18+
- `@langchain/core` 0.3+ (peer dep `>=0.3.0`)
- Works with `@langchain/langgraph` 0.x and 1.x, and `langchain` 1.x
- Zod 3.x (peer dep `^3.23.0`)
- TypeScript 5.x

## Resources

- Ejentum homepage: <https://ejentum.com>
- Pricing: <https://ejentum.com/pricing>
- API reference: <https://ejentum.com/docs/api_reference>
- "Why LLM Agents Fail" essay: <https://ejentum.com/blog/why-llm-agents-fail>
- "Under Pressure" research paper: <https://doi.org/10.5281/zenodo.19392715>
- LangGraph.js documentation: <https://langchain-ai.github.io/langgraphjs/>
- LangChain.js documentation: <https://js.langchain.com>

## License

[MIT](./LICENSE)


## Measured effects

The Ejentum harness is benchmarked publicly under CC BY 4.0 at [github.com/ejentum/benchmarks](https://github.com/ejentum/benchmarks):

- **ELEPHANT** sycophancy: 5.8% composite on GPT-4o (40 real Reddit scenarios)
- **LiveCodeBench Hard**: 85.7% to 100% on Claude Opus (28 competitive programming tasks)
- **Memory retention**: 50% fewer stale facts served (20-turn implicit state changes)
- Plus per-harness numbers across BBH/CausalBench/MuSR, ARC-AGI-3, SciCode, and perception tasks

Methodology, scenarios, run scripts, and raw outputs are all in-repo.
