"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth/auth-client";

export function CtaLink() {
  const { data: session } = useSession();
  const ctaHref = session?.user ? "/students" : "/sign-up";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <Button
        size="lg"
        className="bg-flag-yellow text-flag-blue font-bold text-base px-8 h-12 shadow-xl shadow-flag-yellow/25 hover:bg-flag-blue hover:text-white transition-all duration-150"
        asChild
      >
        <Link href={ctaHref}>
          <Play className="size-4 mr-2 fill-flag-blue" />
          Comenzar gratis
        </Link>
      </Button>
    </div>
  );
}
