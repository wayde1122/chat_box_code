import { HeroSection } from "@/components/home/HeroSection";
import { AgentGrid } from "@/components/home/AgentGrid";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <AgentGrid />
    </main>
  );
}
