export type AgentStatus = "available" | "coming-soon";

export interface Agent {
  id: string;
  name: string;
  description: string;
  icon: "Plane" | "Code" | "Pencil" | "BarChart3" | "Bot";
  href: string;
  status: AgentStatus;
  gradient: string;
}

export const agents: readonly Agent[] = [
  {
    id: "travel",
    name: "智能旅行助手",
    description: "查询天气、推荐景点，为您的旅行提供智能规划",
    icon: "Plane",
    href: "/travel",
    status: "available",
    gradient: "from-violet-500 to-cyan-500",
  },
  {
    id: "code",
    name: "代码助手",
    description: "智能编程助手，帮您解决开发难题",
    icon: "Code",
    href: "/code",
    status: "coming-soon",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    id: "writer",
    name: "写作助手",
    description: "AI 写作伙伴，激发您的创作灵感",
    icon: "Pencil",
    href: "/writer",
    status: "coming-soon",
    gradient: "from-orange-500 to-pink-500",
  },
  {
    id: "analyst",
    name: "数据分析助手",
    description: "智能分析数据，洞察业务趋势",
    icon: "BarChart3",
    href: "/analyst",
    status: "coming-soon",
    gradient: "from-blue-500 to-purple-500",
  },
] as const;

