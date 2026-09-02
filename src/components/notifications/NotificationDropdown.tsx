"use client";

import { useState } from "react";
import { CheckCheck, Trash2, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

const TYPE_COLORS: Record<string, string> = {
  connection_request: "text-gold",
  connection_accepted: "text-green-500",
  connection_declined: "text-destructive",
  new_chapter_recorded: "text-gold",
  next_chapter_created: "text-primary",
  return_approaching: "text-amber-500",
};

const TYPE_ICONS: Record<string, string> = {
  connection_request: "👤",
  connection_accepted: "✓",
  connection_declined: "✗",
  new_chapter_recorded: "✦",
  next_chapter_created: "→",
  return_approaching: "⏱",
};

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <span className="text-3xl opacity-30">🔔</span>
      <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
    </div>
  );
}

export function NotificationDropdown({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead, dismiss, dismissAll } =
    useNotifications();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0" sideOffset={8}>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-display text-sm text-ink">NOTIFICAÇÕES</span>
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-ink"
                    onClick={markAllRead}
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Marcar todas como lidas</TooltipContent>
              </Tooltip>
            )}
            {notifications.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={dismissAll}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Limpar todas</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        <ScrollArea className="max-h-96">
          {notifications.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "group relative flex gap-3 px-4 py-3 transition-colors cursor-pointer",
                    !n.read ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50",
                  )}
                  onClick={() => markRead(n.id)}
                >
                  {!n.read && (
                    <span className="absolute left-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-gold" />
                  )}
                  <span
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-current/20 text-sm",
                      TYPE_COLORS[n.type] ?? "text-muted-foreground",
                    )}
                  >
                    {TYPE_ICONS[n.type] ?? "•"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("font-display text-sm text-ink", !n.read && "font-semibold")}>
                        {n.title}
                      </p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {formatDate(n.date)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {n.description}
                    </p>
                    {n.clientName && (
                      <p className="mt-1 text-[10px] text-gold">Cliente: {n.clientName}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      dismiss(n.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
