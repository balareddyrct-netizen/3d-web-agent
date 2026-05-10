import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { PromptTemplate } from "@langchain/core/prompts";
import { aiTools } from "./tools";

export class CodeAgent {
  private executor: AgentExecutor | null = null;

  constructor(apiKey?: string) {
    if (!apiKey) {
      console.warn("No API key provided. Agent will run in mock mode.");
      return;
    }

    const llm = new ChatGoogleGenerativeAI({
      modelName: "gemini-1.5-flash",
      apiKey: apiKey,
    });

    const template = `Answer the following questions as best you can. You are an expert 3D coding assistant. You have access to the following tools:

{tools}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {input}
Thought:{agent_scratchpad}`;

    const prompt = PromptTemplate.fromTemplate(template);

    const agent = createReactAgent({
      llm,
      tools: aiTools,
      prompt,
    });

    this.executor = new AgentExecutor({
      agent,
      tools: aiTools,
    });
  }

  async run(input: string) {
    if (!this.executor) {
      console.log(`[Mock Agent] reasoning about: ${input}`);
      // Mock some tool execution for demonstration
      if (input.toLowerCase().includes("scaffold")) {
        return await aiTools[2].invoke({ sceneName: "MyScene", elements: ["ambientLight", "OrbitControls"] });
      }
      return "Agent is running in mock mode. Please provide a Gemini API key.";
    }

    console.log(`[Agent] reasoning about: ${input}`);
    const result = await this.executor.invoke({ input });
    return result.output;
  }
}
