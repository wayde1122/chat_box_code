import { llmService } from "./llmService";
import { getWeather } from "./weatherService";
import { searchAttraction } from "./attractionService";
import type { AgentResponse, AgentStep, ToolCallArgs } from "@/types/agent";

/** 可用工具映射 */
const availableTools: Record<string, (args: ToolCallArgs) => Promise<string>> =
  {
    get_weather: async (args) => getWeather(args.city ?? "", args.date),
    get_attraction: async (args) =>
      searchAttraction(args.city ?? "", args.weather ?? ""),
  };

/**
 * 生成系统提示，包含当前日期信息
 */
function getSystemPrompt(): string {
  const today = new Date();
  const dateStr = today.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
  });
  // 格式化为 YYYY-MM-DD
  const isoDate = today.toISOString().split("T")[0];

  return `
你是一个智能旅行助手。你的任务是分析用户的请求，并使用可用工具一步步地解决问题。

# 当前时间:
今天是 ${dateStr}（${isoDate}）。请根据此日期计算用户提到的"今天"、"明天"、"后天"等相对日期。

# 可用工具:
- \`get_weather(city: str, date?: str)\`: 查询指定城市的天气。date 可选，格式为 YYYY-MM-DD，不传则返回当前天气，传入则返回该日期的天气预报（支持未来3天）。
- \`get_attraction(city: str, weather: str)\`: 根据城市和天气搜索推荐的旅游景点。

# 行动格式:
你的回答必须严格遵循以下格式且语言必须是中文简体。首先是你的思考过程，然后是你要执行的具体行动，每次回复只输出一对Thought-Action：
Thought: [这里是你的思考过程和下一步计划]
Action: [这里是你要调用的工具，格式为 function_name(arg_name="arg_value")]

# 任务完成:
当你收集到足够的信息，能够回答用户的最终问题时，你必须在\`Action:\`字段后使用 \`finish(answer="...")\` 来输出最终答案。

请开始吧！
`;
}

/**
 * 解析参数字符串，提取键值对
 * @param argsStr - 参数字符串，如 city="北京", weather="晴天"
 * @returns 参数对象
 */
function parseArgs(argsStr: string): ToolCallArgs {
  const kwargs: ToolCallArgs = {};
  const regex = /(\w+)="([^"]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(argsStr)) !== null) {
    const key = match[1] as keyof ToolCallArgs;
    kwargs[key] = match[2];
  }
  return kwargs;
}

/**
 * 智能旅行助手 Agent
 * 实现 ReAct 模式的思考-行动-观察循环
 */
export async function runAgent(userPrompt: string): Promise<AgentResponse> {
  const steps: AgentStep[] = [];
  const promptHistory = [`用户请求: ${userPrompt}`];
  const systemPrompt = getSystemPrompt();
  const MAX_ITERATIONS = 5;

  let finalAnswer = "";
  let usedTools = false;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    // 构建完整 Prompt
    const fullPrompt = promptHistory.join("\n");

    // 调用 LLM 进行思考
    let llmOutput = await llmService.generate(fullPrompt, systemPrompt);

    // 模型可能会输出多余的 Thought-Action，需要截断
    const truncateMatch = llmOutput.match(
      /(Thought:.*?Action:.*?)(?=\n\s*(?:Thought:|Action:|Observation:)|\s*$)/s
    );
    if (truncateMatch) {
      const truncated = truncateMatch[1].trim();
      if (truncated !== llmOutput.trim()) {
        llmOutput = truncated;
      }
    }

    promptHistory.push(llmOutput);

    // 解析 Thought
    const thoughtMatch = llmOutput.match(/Thought:\s*([\s\S]*?)(?=Action:|$)/);
    const thought = thoughtMatch?.[1]?.trim() ?? "";

    // 解析 Action
    const actionMatch = llmOutput.match(/Action:\s*(.*)/s);
    if (!actionMatch) {
      // 无法解析 Action，尝试直接返回输出
      finalAnswer = llmOutput;
      break;
    }

    const actionStr = actionMatch[1].trim();
    const currentStep: AgentStep = { thought, action: actionStr };

    // 检查是否完成
    if (actionStr.startsWith("finish")) {
      const finishMatch = actionStr.match(/finish\(answer="(.*)"\)/s);
      if (finishMatch) {
        finalAnswer = finishMatch[1];
      } else {
        // 尝试提取括号内的内容
        const altMatch = actionStr.match(/finish\((.*)\)/s);
        finalAnswer = altMatch?.[1] ?? llmOutput;
      }
      steps.push(currentStep);
      break;
    }

    // 解析工具名称和参数
    const toolNameMatch = actionStr.match(/(\w+)\(/);
    const argsMatch = actionStr.match(/\((.*)\)/s);

    if (!toolNameMatch || !argsMatch) {
      currentStep.observation = "解析错误：无法解析工具名称或参数。";
      steps.push(currentStep);
      promptHistory.push(`Observation: ${currentStep.observation}`);
      continue;
    }

    const toolName = toolNameMatch[1];
    const argsStr = argsMatch[1];
    const kwargs = parseArgs(argsStr);

    let observation: string;

    if (toolName in availableTools) {
      usedTools = true;
      observation = await availableTools[toolName](kwargs);
    } else {
      observation = `错误：未定义的工具 '${toolName}'`;
    }

    currentStep.observation = observation;
    steps.push(currentStep);
    promptHistory.push(`Observation: ${observation}`);
  }

  // 如果循环结束还没有答案，使用最后的输出
  if (!finalAnswer && steps.length > 0) {
    const lastStep = steps[steps.length - 1];
    finalAnswer =
      lastStep.observation ?? lastStep.thought ?? "抱歉，我无法完成这个请求。";
  }

  return {
    answer: finalAnswer,
    steps,
    model: "deepseek-ai/DeepSeek-V3.2",
    usedTools,
  };
}
