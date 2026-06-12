"use client";

import { GraduationCap, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSession } from "@/lib/auth/auth-client";

export default function Header() {
  const { data: session } = useSession();
  const user = session?.user;

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "EC";

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b border-border bg-card shrink-0">
      {/* Left side — mobile brand */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="size-7 rounded-lg bg-flag-blue flex items-center justify-center">
          <GraduationCap className="size-3.5 text-flag-yellow" />
        </div>
        <span className="text-base font-bold tracking-tight text-flag-blue">
          Ecuacity
        </span>
      </div>

      {/* Desktop — page context */}
      <div className="hidden md:flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-medium">Admin</span>
        <Badge variant="outline" className="text-[10px] font-semibold text-flag-blue border-flag-blue/30 bg-flag-blue/5 uppercase tracking-wider px-2">
          {user?.role ?? "user"}
        </Badge>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
              <Bell className="size-4" />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-flag-red" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Notificaciones</p>
          </TooltipContent>
        </Tooltip>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-foreground leading-tight">
              {user?.name ?? "Admin"}
            </p>
            <p className="text-[11px] text-muted-foreground">{user?.email ?? ""}</p>
          </div>
          <Avatar className="size-8 cursor-pointer">
            {user?.image && <AvatarImage src={user.image} alt={user.name ?? ""} />}
            <AvatarFallback className="bg-flag-blue text-white text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
