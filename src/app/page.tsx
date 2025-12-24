import { HeroSection } from "@/components/home/HeroSection";
import { AgentGrid } from "@/components/home/AgentGrid";
import { StarryBackground } from "@/components/home/StarryBackground";

export default function Home() {
  return (
    <main className="relative h-screen overflow-hidden">
      {/* 动态星系背景 */}
      <StarryBackground />

      {/* 叠加装饰层 */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        {/* 顶部光晕 */}
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[120px]" />

        {/* 右侧装饰光 */}
        <div className="absolute top-1/3 -right-20 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[100px]" />

        {/* 左下装饰光 */}
        <div className="absolute bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-violet-500/10 blur-[80px]" />

        {/* 底部渐变光 */}
        <div className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[100px]" />
      </div>

      {/* 内容区域 - 垂直居中 */}
      <div className="flex h-full items-center justify-center">
        <div className="w-full">
          <HeroSection />
          <AgentGrid />
        </div>
      </div>

      {/* 底部装饰 - 固定在页面底部 */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-slate-600">
          Powered by AI · Made with ❤️
        </p>
      </div>
    </main>
  );
}
