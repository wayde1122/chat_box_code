export type AgentStatus = "available" | "coming-soon";

export interface Agent {
  id: string;
  name: string;
  description: string;
  icon: "Plane" | "Code" | "Pencil" | "BarChart3" | "Bot" | "Newspaper" | "Gamepad2";
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
    id: "research",
    name: "深度研究助手",
    description: "自动化执行深度研究任务，生成结构化研究报告",
    icon: "BarChart3",
    href: "/research",
    status: "available",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    id: "news",
    name: "每日热点助手",
    description: "根据话题自动获取RSS源，生成每日热点日报",
    icon: "Newspaper",
    href: "/news",
    status: "available",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    id: "games",
    name: "游戏助手",
    description: "经典小游戏合集，休闲娱乐好帮手",
    icon: "Gamepad2",
    href: "/games",
    status: "available",
    gradient: "from-rose-500 to-pink-500",
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
