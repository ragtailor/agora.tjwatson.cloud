import { Navigation } from "@/components/navigation";
import { ChatInput } from "@/components/chat-input";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground tracking-tight text-balance">
            하이미디어 재직자 AI 과정
          </h1>
        </div>
      </main>

      <footer className="pb-8 pt-4">
        <ChatInput />
      </footer>
    </div>
  );
}
