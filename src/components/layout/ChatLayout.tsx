import React from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <div className="fixed inset-x-0 top-0 z-10">
        <Header />
      </div>
      <div className="pt-16 grid w-full grid-cols-[18rem_1fr]">
        <Sidebar />
        <main className="h-[calc(100vh-4rem)] overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

