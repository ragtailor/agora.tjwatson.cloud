"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navigation() {
  return (
    <header className="w-full border-b border-border bg-background">
      <nav className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-lg font-semibold text-foreground">
            Agora
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/notices"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            공지사항
          </Link>
          <Button variant="outline" size="sm">
            로그인
          </Button>
        </div>
      </nav>
    </header>
  );
}
